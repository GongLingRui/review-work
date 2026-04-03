# Tavily Map

> Tavily Map traverses websites like a graph and can explore hundreds of paths in parallel with intelligent discovery to generate comprehensive site maps.

## OpenAPI

````yaml POST /map
paths:
  path: /map
  method: post
  servers:
    - url: https://api.tavily.com/
  request:
    security:
      - title: bearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                Bearer authentication header in the form Bearer <token>, where
                <token> is your Tavily API key (e.g., Bearer tvly-YOUR_API_KEY).
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              url:
                allOf:
                  - type: string
                    description: The root URL to begin the mapping.
                    example: docs.tavily.com
              instructions:
                allOf:
                  - type: string
                    description: >-
                      Natural language instructions for the crawler. When
                      specified, the cost increases to 2 API credits per 10
                      successful pages instead of 1 API credit per 10 pages.
                    example: Find all pages about the Python SDK
                    default: null
              max_depth:
                allOf:
                  - type: integer
                    description: >-
                      Max depth of the mapping. Defines how far from the base
                      URL the crawler can explore.
                    default: 1
                    minimum: 1
                    maximum: 5
              max_breadth:
                allOf:
                  - type: integer
                    description: >-
                      Max number of links to follow per level of the tree (i.e.,
                      per page).
                    default: 20
                    minimum: 1
              limit:
                allOf:
                  - type: integer
                    description: >-
                      Total number of links the crawler will process before
                      stopping.
                    default: 50
                    minimum: 1
              select_paths:
                allOf:
                  - type: array
                    description: >-
                      Regex patterns to select only URLs with specific path
                      patterns (e.g., `/docs/.*`, `/api/v1.*`).
                    items:
                      type: string
                    default: null
              select_domains:
                allOf:
                  - type: array
                    description: >-
                      Regex patterns to select crawling to specific domains or
                      subdomains (e.g., `^docs\.example\.com$`).
                    items:
                      type: string
                    default: null
              exclude_paths:
                allOf:
                  - type: array
                    description: >-
                      Regex patterns to exclude URLs with specific path patterns
                      (e.g., `/private/.*`, `/admin/.*`).
                    items:
                      type: string
                    default: null
              exclude_domains:
                allOf:
                  - type: array
                    description: >-
                      Regex patterns to exclude specific domains or subdomains
                      from crawling (e.g., `^private\.example\.com$`).
                    items:
                      type: string
                    default: null
              allow_external:
                allOf:
                  - type: boolean
                    description: >-
                      Whether to include external domain links in the final
                      results list.
                    default: true
              timeout:
                allOf:
                  - type: number
                    format: float
                    description: >-
                      Maximum time in seconds to wait for the map operation
                      before timing out. Must be between 10 and 150 seconds.
                    minimum: 10
                    maximum: 150
                    default: 150
            required: true
            requiredProperties:
              - url
        examples:
          example:
            value:
              url: docs.tavily.com
              instructions: Find all pages about the Python SDK
              max_depth: 1
              max_breadth: 20
              limit: 50
              select_paths: null
              select_domains: null
              exclude_paths: null
              exclude_domains: null
              allow_external: true
              timeout: 150
        description: Parameters for the Tavily Map request.
    codeSamples:
      - label: Python SDK
        lang: python
        source: |-
          from tavily import TavilyClient

          tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")
          response = tavily_client.map("https://docs.tavily.com")

          print(response)
      - label: JavaScript SDK
        lang: javascript
        source: |-
          const { tavily } = require("@tavily/core");

          const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });
          const response = await tvly.map("https://docs.tavily.com");

          console.log(response);
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              base_url:
                allOf:
                  - type: string
                    description: The base URL that was mapped.
                    example: docs.tavily.com
              results:
                allOf:
                  - type: array
                    description: A list of URLs that were discovered during the mapping.
                    items:
                      type: string
                      example: docs.tavily.com
                    example:
                      - https://docs.tavily.com/welcome
                      - https://docs.tavily.com/documentation/api-credits
                      - https://docs.tavily.com/documentation/about
              response_time:
                allOf:
                  - type: number
                    format: float
                    description: Time in seconds it took to complete the request.
                    example: 1.23
              request_id:
                allOf:
                  - type: string
                    description: >-
                      A unique request identifier you can share with customer
                      support to help resolve issues with specific requests.
                    example: 123e4567-e89b-12d3-a456-426614174111
        examples:
          example:
            value:
              base_url: docs.tavily.com
              results:
                - https://docs.tavily.com/welcome
                - https://docs.tavily.com/documentation/api-credits
                - https://docs.tavily.com/documentation/about
              response_time: 1.23
              request_id: 123e4567-e89b-12d3-a456-426614174111
        description: Map results returned successfully
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - type: object
                    properties:
                      error:
                        type: string
        examples:
          example:
            value:
              detail:
                error: '[400] No starting url provided'
        description: Bad Request - Your request is invalid.
    '401':
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - type: object
                    properties:
                      error:
                        type: string
        examples:
          example:
            value:
              detail:
                error: 'Unauthorized: missing or invalid API key.'
        description: Unauthorized - Your API key is wrong or missing.
    '403':
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - type: object
                    properties:
                      error:
                        type: string
        examples:
          example:
            value:
              detail:
                error: '[403] URL is not supported'
        description: Forbidden - URL is not supported.
    '429':
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - type: object
                    properties:
                      error:
                        type: string
        examples:
          example:
            value:
              detail:
                error: >-
                  Your request has been blocked due to excessive requests.
                  Please reduce rate of requests.
        description: Too many requests - Rate limit exceeded
    '432':
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - type: object
                    properties:
                      error:
                        type: string
        examples:
          example:
            value:
              detail:
                error: >-
                  This request exceeds your plan's set usage limit. Please
                  upgrade your plan or contact support@tavily.com
        description: Key limit or Plan Limit exceeded
    '433':
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - type: object
                    properties:
                      error:
                        type: string
        examples:
          example:
            value:
              detail:
                error: >-
                  This request exceeds the pay-as-you-go limit. You can increase
                  your limit on the Tavily dashboard.
        description: PayGo limit exceeded
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - type: object
                    properties:
                      error:
                        type: string
        examples:
          example:
            value:
              detail:
                error: '[500] Internal server error'
        description: Internal Server Error - We had a problem with our server.
  deprecated: false
  type: path
components:
  schemas: {}

````