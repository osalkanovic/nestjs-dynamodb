import { DynamoDB } from 'aws-sdk'
import {
  DataMapper,
  CreateTableOptions,
  getSchema,
} from '@aws/dynamodb-data-mapper'
import { DynamoDBClass } from '../module/dynamodb.interfaces'
import { getKeys } from './getKeys'
import { unmarshallItem } from '@aws/dynamodb-data-marshaller'

import { getTable } from './getTable'

type instanceOfDynamoDBClass = InstanceType<DynamoDBClass>

export class GetModelForClass<T extends instanceOfDynamoDBClass> {
  constructor(
    dynamoDBClass: DynamoDBClass,
    tableOptions: CreateTableOptions,
    dynamoDBClient: DynamoDB,
    mapper: DataMapper,
  ) {
    this.dynamoDBClass = dynamoDBClass
    this.table = getTable(dynamoDBClass)
    this.dynamoDBClient = dynamoDBClient
    this.mapper = mapper
    this.schema = getSchema(new dynamoDBClass())
    const { hash, range } = getKeys(this.schema)
    this.hashKey = hash
    this.rangeKey = range
    mapper.ensureTableExists(dynamoDBClass, tableOptions)
  }
  private dynamoDBClass: DynamoDBClass
  private table: string
  private dynamoDBClient: DynamoDB
  private mapper: DataMapper
  private schema: any
  private hashKey: string
  private rangeKey: string

  getDynamoDBClient(): DynamoDB {
    return this.dynamoDBClient
  }

  getSchema(): any {
    return this.schema
  }

  getTable(): string {
    return this.table
  }

  getValueType(value): string {
    if (Array.isArray(value)) {
      const arrayValue = value[0]
      if (typeof arrayValue === 'number') {
        //TODO
        return 'NS'
      } else {
        return 'SS'
      }
    } else if (typeof value === 'string') {
      return 'S'
    } else if (typeof value === 'number') {
      return 'N'
    } else if (typeof value === 'boolean') {
      return 'BOOL'
    }
    //TODO
    return ''
  }
  async create(input: Partial<T>): Promise<T> {
    const toSave = Object.assign(new this.dynamoDBClass(), input)
    return this.mapper.put(toSave)
  }

  async find(input?: Partial<DynamoDBClass>, options?: any): Promise<T[]> {
    let results: T[] = []
    const keys = Object.keys(input)
    // if (!input || JSON.stringify(input) === JSON.stringify({})) {
    //   for await (const item of this.mapper.scan(this.dynamoDBClass)) {
    //     results.push(item)
    //   }
    // } else if (
    //   keys.includes(this.hashKey) ||
    //   (keys.includes(this.hashKey) && keys.includes(this.rangeKey))
    // ) {
    //   for await (const item of this.mapper.query(this.dynamoDBClass, input)) {
    //     results.push(item)
    //   }
    // } else {
    let parseObject = (): any => {
      let obj: any = {
        TableName: this.table,
        FilterExpression: '',
        IndexName: `${
          this.table.charAt(0).toUpperCase() + this.table.slice(1)
        }Index`,
      }
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (Array.isArray(input[key])) {
          for (let j = 0; j < input[key].length; j++) {
            obj = {
              ...obj,
              ExpressionAttributeValues: {
                ...obj.ExpressionAttributeValues,
                [`:${key}Value${j}`]: {
                  [this.getValueType(this.clearValue(input[key][j]))]:
                    input[key][j],
                },
              },
            }
          }
          //TODO run function for contains
          obj = {
            ...obj,
            FilterExpression: `${obj.FilterExpression} ${this.checkCondition(
              input[key],
            )} ${this.generateValue(input[key], key)}`,
          }
        } else if (this.schema[key].type === 'Collection') {
          obj = {
            ...obj,
            ExpressionAttributeValues: {
              ...obj.ExpressionAttributeValues,
              [`:${key}Value`]: {
                [this.getValueType(input[key])]: this.clearValue(input[key]),
              },
            },
            FilterExpression: `${obj.FilterExpression} ${this.checkCondition(
              input[key],
            )} contains(${key}, :${key}Value)`,
          }
        } else {
          //there
          obj = {
            ...obj,
            ...(this.schema[key].indexKeyConfigurations &&
            this.schema[key].indexKeyConfigurations[
              `${this.table.charAt(0).toUpperCase() + this.table.slice(1)}Index`
            ] === 'HASH'
              ? {
                  KeyConditionExpression: 'category = :categoryValue',
                  ScanIndexForward: false,
                }
              : {
                  FilterExpression: `${
                    obj.FilterExpression
                  } ${this.checkCondition(input[key])} ${this.generateCondition(
                    key,
                    input[key],
                  )}`,
                }),
            ExpressionAttributeValues: {
              ...obj.ExpressionAttributeValues,
              [`:${key}Value`]: {
                [this.getValueType(input[key])]: this.clearValue(input[key]),
              },
            },
          }
        }
      }

      obj.FilterExpression = obj.FilterExpression.split(' ').splice(2).join(' ')

      if (options?.limit) {
        obj = { ...obj, Limit: options?.limit }
      }
      if (options?.pageSize) {
        obj = { ...obj, PageSize: options?.pageSize }
      }
      if (options?.lastEvaluatedKey) {
        obj = { ...obj, LastEvaluatedKey: options?.lastEvaluatedKey }
      }

      return obj
    }

    const parsedObj = parseObject()
    for (const key in parsedObj) {
      if (
        (typeof parsedObj[key] === 'string' ||
          parsedObj[key] instanceof String) &&
        parsedObj[key].trim() === ''
      ) {
        parsedObj[key] = undefined
      }
    }

    const items: DynamoDB.ItemList = await new Promise((resolve, reject) => {
      if ('KeyConditionExpression' in parsedObj) {
        return this.dynamoDBClient.query(parsedObj, (err, data) => {
          if (err) reject(err)
          // console.log('DATA', data)
          resolve(data?.Items)
        })
      } else {
        return this.dynamoDBClient.scan(parsedObj, (err, data) => {
          if (err) reject(err)
          // console.log('DATA', data)
          resolve(data.Items)
        })
      }
    })

    return items.map(item => unmarshallItem(this.schema, item))
    // }
  }
  generateCondition(key, value) {
    if (value.indexOf('LIKE') > -1) {
      return `contains(${key}, :${key}Value)`
    } else {
      return `${key} = :${key}Value`
    }
  }

  clearValue(value) {
    return value.replace(/AND /g, '').replace(/OR /g, '').replace(/LIKE /g, '')
  }
  generateValue(value, attr) {
    if (Array.isArray(value)) {
      if (this.schema[attr].type === 'Collection') {
        let temp = '('
        for (let i = 0; i < value.length; i++) {
          if (i === 0) {
            temp += `contains(${attr}, :${attr}Value${i})`
          } else {
            temp += ` OR contains(${attr}, :${attr}Value${i})`
          }
        }
        temp += ')'
        return temp
      } else {
        let temp = '('
        for (let i = 0; i < value.length; i++) {
          if (i === 0) {
            temp += `${attr} = :${attr}Value${i}`
          } else {
            temp += ` OR ${attr} = :${attr}Value${i}`
          }
        }
        temp += ')'
        return temp
      }
    }
    return value
  }
  async findById(id: string): Promise<T> {
    const test = new this.dynamoDBClass()
    test.id = id
    return this.mapper.get(test)
  }
  checkCondition(value: any) {
    if (Array.isArray(value)) {
      return 'AND'
    }
    if (value.startsWith('OR')) {
      return 'OR'
    }
    return 'AND'
  }
  async findByIdAndDelete(id: string): Promise<DynamoDB.DeleteItemOutput> {
    return new Promise((resolve, reject) =>
      this.dynamoDBClient.deleteItem(
        this.getDeleteItemInput(id),
        (err, data) => {
          if (err) reject(err)
          resolve(data)
        },
      ),
    )
  }

  async findByIdAndUpdate(
    id: string,
    update: Partial<DynamoDBClass>,
  ): Promise<T> {
    const item = await this.mapper.get(
      Object.assign(new this.dynamoDBClass(), { id }),
    )

    return this.mapper.update(Object.assign(item, update))
  }
  private getDeleteItemInput(id: string): DynamoDB.DeleteItemInput {
    return {
      Key: {
        id: {
          S: id,
        },
      },
      TableName: this.table,
    }
  }
  private getFindItemInput(key: string, value: string): DynamoDB.ScanInput {
    return {
      ExpressionAttributeValues: {
        ':catval': {
          S: value,
        },
      },
      FilterExpression: `${key} = :catval`,
      TableName: this.table,
    }
  }
}

export const getModelForClass = <T extends instanceOfDynamoDBClass>(
  dynamoDBClass: DynamoDBClass,
  tableOptions: CreateTableOptions,
  dynamoDBClient: DynamoDB,
  mapper: DataMapper,
) =>
  new GetModelForClass<T>(dynamoDBClass, tableOptions, dynamoDBClient, mapper)
