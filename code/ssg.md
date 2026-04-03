项目 SSG 重构概述

在这个 Gatsby 项目中，SSG（静态站点生成）通过以下几个关键部分实现：

1. gatsby-node.js** 文件**：用于创建页面和配置 Webpack。
2. GraphQL 查询：用于获取数据。
3. useStaticQuery** 钩子**：用于在组件中获取静态数据。

详细解释

1. gatsby-node.js 文件

gatsby-node.js 文件是 Gatsby 项目的核心配置文件之一，用于在构建时创建页面和配置 Webpack。

createPages 函数

createPages 函数用于动态创建页面。它通过 GraphQL 查询获取数据，并根据数据创建页面。

```
import { CreatePageArgs, CreatePagesArgs, CreateWebpackConfigArgs } from 'gatsby'
import path from 'path'
import fs from 'fs'

export const createPages = async (args: CreatePagesArgs) => {
  const { actions, graphql } = args

  const result = await graphql(`
    query AllApp {
      allApp {
        nodes {
          slug
          component
          fullscreen
          noDefaultLayout
        }
      }
    }
  `) as {
    data: {
      allApp: {
        nodes: Array<{
          slug: string
          component: string
        }>
      }
    }
  }

  result.data.allApp.nodes.forEach(async ({ slug, component, ...rest }) => {
    if (component) {
      const componentPath = path.resolve(__dirname, component)
      if (fs.statSync(componentPath).isFile()) {
        actions.createPage({
          path: `/apps/${slug}`,
          matchPath: `/apps/${slug}/*subpath`,
          component: componentPath,
          context: { slug, ...rest },
        })
        actions.createPage({
          path: `/[locale]/apps/${slug}`,
          matchPath: `/:locale/apps/${slug}/*subpath`,
          component: componentPath,
          context: { slug, ...rest },
        })
      }
    }
  })
}
```

- GraphQL 查询：获取所有应用的数据，包括 slug 和 component。
- 创建页面：根据查询结果动态创建页面，并设置路径和上下文。

onCreatePage 函数

onCreatePage 函数用于在页面创建时修改页面路径，以支持多语言（locale）。

```
export const onCreatePage = async (args: CreatePagesArgs) => {
  const { actions, page: unknownPage } = args

  const page = unknownPage as CreatePageArgs['page']

  if (page.path?.startsWith('/dev-404-page')) return

  if (page.path?.startsWith(`/[locale]/`)) return

  const newPage = { ...page }
  newPage.path = `/[locale]${newPage.path}`
  if (newPage.matchPath) {
    newPage.matchPath = `/:locale${page.matchPath || '/'}`
  } else {
    newPage.matchPath = `/:locale${page.path}`
  }
  actions.createPage({
    ...newPage,
    context: { ...newPage.context },
  })
}
```

- 修改路径：为每个页面添加 locale 前缀，以支持多语言。

onCreateWebpackConfig 函数

onCreateWebpackConfig 函数用于自定义 Webpack 配置。
```
export const onCreateWebpackConfig = (args: CreateWebpackConfigArgs) => {
  const { actions, loaders, getConfig, stage } = args

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.worker\.(js|ts)$/,
          use: [{ loader: 'worker-loader' }, loaders.js()],
        },
        {
          test: /\.node$/,
          loader: 'node-loader'
        },
        {
          test: /\.obj$/,
          use: [
            {
              loader: 'file-loader',
            }
          ]
        }
      ],
    },
    resolve: {
      fallback: {
        fs: false,
        path: false,
        crypto: false,
      },
    },
  })

  const config = getConfig();

  config.optimization.splitChunks = {
    cacheGroups: {
      babylonloader: {
        test: /@babylonjs\/loaders/,
        name: 'vendor-babylon-loaders',
        chunks: 'all',
      },
    },
  };

  actions.replaceWebpackConfig(config);
}
```
- 自定义 Webpack 规则：添加对 .worker.js、.node 和 .obj 文件的处理。
- 配置 SplitChunksPlugin：优化代码分割。

2. GraphQL 查询

Gatsby 使用 GraphQL 查询来获取数据。在 createPages 函数中，通过 GraphQL 查询获取所有应用的数据。
```
query AllApp {
  allApp {
    nodes {
      slug
      component
      fullscreen
      noDefaultLayout
    }
  }
}
```
3. useStaticQuery 钩子

useStaticQuery 钩子用于在组件中获取静态数据。
```
import { graphql, useStaticQuery } from "gatsby"

export const useSiteMetadata = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          subtitle
          description
          image
          siteUrl
        }
      }
    }
  `)

  return data.site.siteMetadata
}
```
- GraphQL 查询：获取站点的元数据。
- 返回数据：返回查询到的站点元数据。

总结

在这个 Gatsby 项目中，SSG 重构通过以下几个关键部分实现：

4. gatsby-node.js** 文件**：用于创建页面和配置 Webpack。
  - createPages 函数：动态创建页面。
  - onCreatePage 函数：修改页面路径以支持多语言。
  - onCreateWebpackConfig 函数：自定义 Webpack 配置。

5. GraphQL 查询：用于获取数据。
  - 在 createPages 函数中使用 GraphQL 查询获取所有应用的数据。
  - 在组件中使用 useStaticQuery 钩子获取静态数据。

通过这些步骤，项目实现了静态站点生成（SSG），并支持多语言和自定义 Webpack 配置。
