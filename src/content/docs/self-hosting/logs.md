---
title: Logs and tracing
description: Read the server's logs and send them to OpenTelemetry.
---

The server logs to standard output, so `docker logs chek` shows them. Set the level with `RUST_LOG`, such as `RUST_LOG=debug`.

Every request is logged with its method, route, path, status, duration, client address and user agent, inside a span named after its route, such as `GET /api/v1/publications/{publicationId}/pages/{pageIndex}`, so traces group by endpoint.

## OpenTelemetry

To send logs and traces to an OpenTelemetry collector over OTLP/HTTP:

```sh
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_SERVICE_NAME=chek
```

The standard `OTEL_*` variables apply. The exporter doesn't use TLS, since the collector is expected on the same private network. Queued data is sent when the server shuts down.
