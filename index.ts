import { DomainName, HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { App, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  AccountRecovery,
  OAuthScope,
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
  UserPoolEmail,
  UserPoolIdentityProviderGoogle,
} from 'aws-cdk-lib/aws-cognito';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import {
  CloudFrontTarget,
  UserPoolDomainTarget,
} from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { CustomersApi } from './functions/customers';

export class TechStopStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const domainName = 'techstop.abhithube.com';

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'abhithube.com',
      privateZone: false,
    });

    const frontendCertificate = new DnsValidatedCertificate(
      this,
      'FrontendCertificate',
      {
        domainName,
        subjectAlternativeNames: [`*.${domainName}`],
        hostedZone,
        region: 'us-east-1',
      }
    );

    const bucket = new Bucket(this, 'Bucket', {
      bucketName: 'techstop-client',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket),
      },
      certificate: frontendCertificate,
      defaultRootObject: 'index.html',
      domainNames: [domainName],
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    const frontendDomain = new ARecord(this, 'FrontendDomain', {
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: hostedZone,
    });

    const userPool = new UserPool(this, 'UserPool', {
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      autoVerify: {
        email: true,
      },
      email: UserPoolEmail.withSES({
        fromEmail: 'abhimanyuthube@gmail.com',
        fromName: 'TechStop',
      }),
      passwordPolicy: {
        minLength: 6,
        requireDigits: false,
        requireLowercase: false,
        requireSymbols: false,
        requireUppercase: false,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: true,
      },
    });

    const provider = new UserPoolIdentityProviderGoogle(
      this,
      'UserPoolIdentityProviderGoogle',
      {
        userPool,
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        scopes: ['profile', 'email'],
        attributeMapping: {
          email: ProviderAttribute.GOOGLE_EMAIL,
          preferredUsername: ProviderAttribute.GOOGLE_NAME,
        },
      }
    );

    const client = new UserPoolClient(this, 'UserPoolClient', {
      userPool,
      authFlows: {
        userPassword: true,
      },
      oAuth: {
        scopes: [OAuthScope.EMAIL, OAuthScope.PROFILE],
        callbackUrls: [
          'http://localhost:3000',
          'https://techstop.abhithube.com',
        ],
      },
      preventUserExistenceErrors: true,
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
        UserPoolClientIdentityProvider.GOOGLE,
      ],
    });

    client.node.addDependency(provider);

    const userPoolDomain = new UserPoolDomain(this, 'UserPoolDomain', {
      userPool,
      customDomain: {
        certificate: frontendCertificate,
        domainName: `auth.${domainName}`,
      },
    });

    userPoolDomain.node.addDependency(frontendDomain);

    new ARecord(this, 'AuthDomain', {
      recordName: `auth.${domainName}`,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain)),
      zone: hostedZone,
    });

    const backendCertificate = new DnsValidatedCertificate(
      this,
      'BackendCertificate',
      {
        domainName: `*.${domainName}`,
        hostedZone,
      }
    );

    const backendDomainName = new DomainName(this, 'BackendDomainName', {
      domainName: `api.${domainName}`,
      certificate: backendCertificate,
    });

    const httpApi = new HttpApi(this, 'HttpApi', {
      apiName: 'TechStopHttpApi',
      defaultDomainMapping: {
        domainName: backendDomainName,
      },
    });

    new ARecord(this, 'BackendDomain', {
      recordName: `api.${domainName}`,
      target: RecordTarget.fromAlias({
        bind: () => ({
          dnsName: backendDomainName.regionalDomainName,
          hostedZoneId: backendDomainName.regionalHostedZoneId,
        }),
      }),
      zone: hostedZone,
    });

    new CustomersApi(this, 'CustomersApi', {
      httpApi,
      userPool,
    });
  }
}

const app = new App();

new TechStopStack(app, 'TechStopStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
