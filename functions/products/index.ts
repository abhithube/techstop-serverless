import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';
import { bundling, environment } from '../..';

interface ProductsApiProps extends StackProps {
  readonly httpApi: HttpApi;
}

export class ProductsApi extends Construct {
  constructor(scope: Construct, id: string, props: ProductsApiProps) {
    super(scope, id);

    const getProductsFunction = new NodejsFunction(
      this,
      'GetProductsFunction',
      {
        bundling,
        entry: path.join(__dirname, './getProducts.ts'),
        environment,
      }
    );

    props.httpApi.addRoutes({
      path: '/products',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'GetProductsLambdaIntegration',
        getProductsFunction
      ),
    });

    const getProductFunction = new NodejsFunction(this, 'GetProductFunction', {
      bundling,
      entry: path.join(__dirname, './getProduct.ts'),
      environment,
    });

    props.httpApi.addRoutes({
      path: '/products/{id}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'GetProductLambdaIntegration',
        getProductFunction
      ),
    });
  }
}
