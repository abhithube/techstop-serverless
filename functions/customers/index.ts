import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { StackProps } from 'aws-cdk-lib';
import { UserPool, UserPoolOperation } from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';

interface CustomersApiProps extends StackProps {
  readonly userPool: UserPool;
  readonly httpApi: HttpApi;
}

export class CustomersApi extends Construct {
  constructor(scope: Construct, id: string, props: CustomersApiProps) {
    super(scope, id);

    const environment = {
      DATABASE_URL: process.env.DATABASE_URL!,
    };

    const createCustomerFunction = new NodejsFunction(
      this,
      'CreateCustomerFunction',
      {
        bundling: {
          externalModules: ['aws-sdk'],
          minify: true,
        },
        entry: path.join(__dirname, './createCustomer.ts'),
        environment,
      }
    );

    props.userPool.addTrigger(
      UserPoolOperation.POST_CONFIRMATION,
      createCustomerFunction
    );

    const getCustomerFunction = new NodejsFunction(
      this,
      'GetCustomerFunction',
      {
        bundling: {
          externalModules: ['aws-sdk'],
          minify: true,
        },
        entry: path.join(__dirname, './getCustomer.ts'),
        environment,
      }
    );

    props.httpApi.addRoutes({
      path: '/customers/{id}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'GetCustomerLambdaIntegration',
        getCustomerFunction
      ),
    });
  }
}
