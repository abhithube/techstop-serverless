import {
  HttpApi,
  HttpMethod,
  HttpNoneAuthorizer,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { StackProps } from 'aws-cdk-lib';
import { UserPool, UserPoolOperation } from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';
import { bundling, environment } from '../..';

interface CustomersApiProps extends StackProps {
  readonly userPool: UserPool;
  readonly httpApi: HttpApi;
  readonly dynamoTable: Table;
}

export class CustomersApi extends Construct {
  constructor(scope: Construct, id: string, props: CustomersApiProps) {
    super(scope, id);

    const createCustomerFunction = new NodejsFunction(
      this,
      'CreateCustomerFunction',
      {
        bundling,
        entry: path.join(__dirname, './createCustomer.ts'),
        environment,
      }
    );

    props.userPool.addTrigger(
      UserPoolOperation.POST_CONFIRMATION,
      createCustomerFunction
    );

    props.dynamoTable.grantReadWriteData(createCustomerFunction);

    const getCustomerFunction = new NodejsFunction(
      this,
      'GetCustomerFunction',
      {
        bundling,
        entry: path.join(__dirname, './getCustomer.ts'),
        environment,
      }
    );

    props.httpApi.addRoutes({
      path: '/customers/{username}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'GetCustomerLambdaIntegration',
        getCustomerFunction
      ),
      authorizer: new HttpNoneAuthorizer(),
    });

    props.dynamoTable.grantReadWriteData(getCustomerFunction);
  }
}
