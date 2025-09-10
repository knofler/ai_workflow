import process from 'node:process';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const serviceName = process.env.OTEL_SERVICE_NAME || 'auth-service';
const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';
const env = process.env.NODE_ENV || 'development';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const exporter = new OTLPTraceExporter({ url: `${endpoint}/v1/traces` });
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    'deployment.environment': process.env.DEPLOY_ENV || env,
  }),
  traceExporter: exporter,
  spanProcessor: new BatchSpanProcessor(exporter),
  instrumentations: [],
});

sdk.start().catch(() => {});
process.on('SIGTERM', async () => { try { await sdk.shutdown(); } catch {} });
