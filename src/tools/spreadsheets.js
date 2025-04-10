import { z } from 'zod';
    import { sheets, handleApiError } from '../auth.js';

    // Common schemas
    const spreadsheetPropertiesSchema = z.object({
      title: z.string().optional(),
      locale: z.string().optional(),
      autoRecalc: z.string().optional(),
      timeZone: z.string().optional(),
      defaultFormat: z.any().optional(),
      iterativeCalculationSettings: z.any().optional(),
      spreadsheetTheme: z.any().optional()
    }).optional();

    export const spreadsheetTools = [
      {
        name: "createSpreadsheet",
        description: "Creates a new spreadsheet with the specified properties",
        schema: {
          properties: spreadsheetPropertiesSchema,
          sheets: z.array(z.any()).optional(),
          namedRanges: z.array(z.any()).optional()
        },
        handler: async ({ properties, sheets: sheetsList, namedRanges }) => {
          try {
            const resource = { properties, sheets: sheetsList, namedRanges };
            const response = await sheets.spreadsheets.create({ resource });
            
            return {
              content: [{ 
                type: "text", 
                text: `Spreadsheet created successfully. ID: ${response.data.spreadsheetId}
Title: ${response.data.properties.title}
URL: https://docs.google.com/spreadsheets/d/${response.data.spreadsheetId}/edit`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "getSpreadsheet",
        description: "Gets a spreadsheet by ID",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet to retrieve"),
          ranges: z.array(z.string()).optional().describe("The ranges to retrieve from the spreadsheet"),
          includeGridData: z.boolean().optional().describe("True if grid data should be returned")
        },
        handler: async ({ spreadsheetId, ranges, includeGridData }) => {
          try {
            const response = await sheets.spreadsheets.get({
              spreadsheetId,
              ranges,
              includeGridData
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Spreadsheet details:
ID: ${response.data.spreadsheetId}
Title: ${response.data.properties.title}
Sheets: ${response.data.sheets.map(s => s.properties.title).join(', ')}
URL: https://docs.google.com/spreadsheets/d/${response.data.spreadsheetId}/edit`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "batchUpdate",
        description: "Applies one or more updates to a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet to update"),
          requests: z.array(z.any()).describe("A list of updates to apply to the spreadsheet"),
          includeSpreadsheetInResponse: z.boolean().optional().describe("Determines if the update response should include the spreadsheet resource"),
          responseRanges: z.array(z.string()).optional().describe("Limits the ranges included in the response spreadsheet"),
          responseIncludeGridData: z.boolean().optional().describe("True if grid data should be returned")
        },
        handler: async ({ spreadsheetId, requests, includeSpreadsheetInResponse, responseRanges, responseIncludeGridData }) => {
          try {
            const response = await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              resource: {
                requests,
                includeSpreadsheetInResponse,
                responseRanges,
                responseIncludeGridData
              }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Batch update completed successfully.
Spreadsheet ID: ${spreadsheetId}
Updates applied: ${requests.length}
Response: ${JSON.stringify(response.data.replies || {}, null, 2)}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      }
    ];
