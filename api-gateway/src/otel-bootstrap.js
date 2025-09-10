// Minimal OpenTelemetry bootstrap for Node (CommonJS/ESM friendly)
import process from 'node:process';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const serviceName = process.env.OTEL_SERVICE_NAME || 'api-gateway';
const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';
const env = process.env.NODE_ENV || 'development';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    'deployment.environment': process.env.DEPLOY_ENV || env,
  }),
  traceExporter: new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }),
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: `${endpoint}/v1/traces` })),
  instrumentations: [], // auto-instrument via peer deps later if desired
});

// In some SDK versions, start() may return void; guard before calling .catch
const _start = sdk.start?.();
if (_start && typeof _start.catch === 'function') {
  _start.catch(() => {});
}

process.on('SIGTERM', async () => {
  try { await sdk.shutdown(); } catch {}
});
