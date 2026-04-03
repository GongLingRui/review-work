# Usage

> Get API key and account usage details

## OpenAPI

````yaml GET /usage
paths:
  path: /usage
  method: get
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
    body: {}
    codeSamples: []
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              key:
                allOf:
                  - type: object
                    properties:
                      usage:
                        type: integer
                        description: Current usage count for the API key
                        example: 150
                      limit:
                        type: integer
                        description: >-
                          Usage limit for the API key. Returns null if unlimited
                          (2147483647)
                        example: 1000
              account:
                allOf:
                  - type: object
                    description: Account plan and usage information
                    properties:
                      current_plan:
                        type: string
                        description: The current subscription plan name
                        example: Bootstrap
                      plan_usage:
                        type: integer
                        description: Current usage count for the plan
                        example: 500
                      plan_limit:
                        type: integer
                        description: Usage limit for the current plan
                        example: 15000
                      paygo_usage:
                        type: integer
                        description: Current pay-as-you-go usage count
                        example: 25
                      paygo_limit:
                        type: integer
                        description: Pay-as-you-go usage limit
                        example: 100
        examples:
          example:
            value:
              key:
                usage: 150
                limit: 1000
              account:
                current_plan: Bootstrap
                plan_usage: 500
                plan_limit: 15000
                paygo_usage: 25
                paygo_limit: 100
        description: Usage details returned successfully
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
  deprecated: false
  type: path
components:
  schemas: {}

````