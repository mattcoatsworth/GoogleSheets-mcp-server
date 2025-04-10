import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
    import { spreadsheetTools } from './tools/spreadsheets.js';
    import { sheetTools } from './tools/sheets.js';
    import { valueTools } from './tools/values.js';
    import { developerMetadataTools } from './tools/developerMetadata.js';
    import { sheetsResources } from './resources/sheets-resources.js';

    // Create an MCP server for Google Sheets API
    const server = new McpServer({
      name: "Google Sheets API",
      version: "1.0.0",
      description: "MCP Server for interacting with Google Sheets API"
    });

    // Register all tools
    const allTools = [
      ...spreadsheetTools,
      ...sheetTools,
      ...valueTools,
      ...developerMetadataTools
    ];

    allTools.forEach(tool => {
      server.tool(
        tool.name,
        tool.schema,
        tool.handler,
        { description: tool.description }
      );
    });

    // Register all resources
    sheetsResources.forEach(resource => {
      server.resource(
        resource.name,
        resource.template,
        resource.handler
      );
    });

    export { server };
