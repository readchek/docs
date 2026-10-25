---
title: Read logs and traces
description: Read the server's logs, and send logs and traces to OpenTelemetry.
---

The server writes its logs to standard output. With Docker, run `docker logs chek` to read them. To change the level, set `RUST_LOG`, such as `RUST_LOG=debug`. The default is `info`.

The server logs each request with its method, route, path, status, duration, client address, and user agent. Each request has a span named after its route, such as `GET /api/v1/publications/{publicationId}/pages/{pageIndex}`. Traces group by endpoint because of these names.

## Send logs and traces to OpenTelemetry

Set the address of your OpenTelemetry collector. The server sends logs and traces to it over OTLP/HTTP.

```sh
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_SERVICE_NAME=chek
```

The other standard `OTEL_*` variables apply too. The exporter doesn't use TLS, so run the collector on the same private network as the server. When the server shuts down, it sends the data in its queue.
