import { z } from 'zod';
    import { sheets, handleApiError } from '../auth.js';

    export const valueTools = [
      {
        name: "getValues",
        description: "Gets values from a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet to retrieve data from"),
          range: z.string().describe("The A1 notation or R1C1 notation of the range to retrieve values from"),
          majorDimension: z.enum(["ROWS", "COLUMNS"]).optional().describe("The major dimension that results should use"),
          valueRenderOption: z.enum(["FORMATTED_VALUE", "UNFORMATTED_VALUE", "FORMULA"]).optional().describe("How values should be represented in the output")
        },
        handler: async ({ spreadsheetId, range, majorDimension = "ROWS", valueRenderOption = "FORMATTED_VALUE" }) => {
          try {
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range,
              majorDimension,
              valueRenderOption
            });
            
            const values = response.data.values || [];
            
            return {
              content: [{ 
                type: "text", 
                text: `Retrieved values from ${range}:
${values.length > 0 
  ? `Data (${values.length} ${majorDimension.toLowerCase()}):
${values.map(row => row.join('\t')).join('\n')}`
  : 'No data found in the specified range.'}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "updateValues",
        description: "Updates values in a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet to update"),
          range: z.string().describe("The A1 notation of the values to update"),
          values: z.array(z.array(z.any())).describe("The data to write"),
          majorDimension: z.enum(["ROWS", "COLUMNS"]).optional().describe("The major dimension of the values"),
          valueInputOption: z.enum(["RAW", "USER_ENTERED"]).optional().describe("How the input data should be interpreted")
        },
        handler: async ({ spreadsheetId, range, values, majorDimension = "ROWS", valueInputOption = "USER_ENTERED" }) => {
          try {
            const response = await sheets.spreadsheets.values.update({
              spreadsheetId,
              range,
              valueInputOption,
              resource: {
                range,
                majorDimension,
                values
              }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Values updated successfully.
Spreadsheet ID: ${spreadsheetId}
Range: ${response.data.updatedRange}
Updated cells: ${response.data.updatedCells}
Updated rows: ${response.data.updatedRows}
Updated columns: ${response.data.updatedColumns}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "appendValues",
        description: "Appends values to a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet to append data to"),
          range: z.string().describe("The A1 notation of the table to append to"),
          values: z.array(z.array(z.any())).describe("The data to append"),
          majorDimension: z.enum(["ROWS", "COLUMNS"]).optional().describe("The major dimension of the values"),
          valueInputOption: z.enum(["RAW", "USER_ENTERED"]).optional().describe("How the input data should be interpreted"),
          insertDataOption: z.enum(["OVERWRITE", "INSERT_ROWS"]).optional().describe("How the input data should be inserted")
        },
        handler: async ({ 
          spreadsheetId, 
          range, 
          values, 
          majorDimension = "ROWS", 
          valueInputOption = "USER_ENTERED",
          insertDataOption = "INSERT_ROWS"
        }) => {
          try {
            const response = await sheets.spreadsheets.values.append({
              spreadsheetId,
              range,
              valueInputOption,
              insertDataOption,
              resource: {
                range,
                majorDimension,
                values
              }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Values appended successfully.
Spreadsheet ID: ${spreadsheetId}
Range: ${response.data.updates.updatedRange}
Updated cells: ${response.data.updates.updatedCells}
Updated rows: ${response.data.updates.updatedRows}
Updated columns: ${response.data.updates.updatedColumns}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "clearValues",
        description: "Clears values from a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet to clear"),
          range: z.string().describe("The A1 notation of the values to clear")
        },
        handler: async ({ spreadsheetId, range }) => {
          try {
            const response = await sheets.spreadsheets.values.clear({
              spreadsheetId,
              range,
              resource: {}
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Values cleared successfully.
Spreadsheet ID: ${spreadsheetId}
Range: ${response.data.clearedRange}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "batchGetValues",
        description: "Gets values from multiple ranges of a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet to retrieve data from"),
          ranges: z.array(z.string()).describe("The A1 notation of the ranges to retrieve values from"),
          majorDimension: z.enum(["ROWS", "COLUMNS"]).optional().describe("The major dimension that results should use"),
          valueRenderOption: z.enum(["FORMATTED_VALUE", "UNFORMATTED_VALUE", "FORMULA"]).optional().describe("How values should be represented in the output")
        },
        handler: async ({ spreadsheetId, ranges, majorDimension = "ROWS", valueRenderOption = "FORMATTED_VALUE" }) => {
          try {
            const response = await sheets.spreadsheets.values.batchGet({
              spreadsheetId,
              ranges,
              majorDimension,
              valueRenderOption
            });
            
            const valueRanges = response.data.valueRanges || [];
            
            let resultText = `Retrieved values from ${ranges.length} ranges:\n\n`;
            
            valueRanges.forEach((vr, i) => {
              const values = vr.values || [];
              resultText += `Range ${i+1} (${vr.range}):\n`;
              resultText += values.length > 0 
                ? `${values.map(row => row.join('\t')).join('\n')}\n\n`
                : 'No data found in this range.\n\n';
            });
            
            return {
              content: [{ type: "text", text: resultText.trim() }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "batchUpdateValues",
        description: "Updates multiple ranges of values in a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet to update"),
          data: z.array(z.object({
            range: z.string().describe("The A1 notation of the values to update"),
            values: z.array(z.array(z.any())).describe("The data to write"),
            majorDimension: z.enum(["ROWS", "COLUMNS"]).optional().describe("The major dimension of the values")
          })).describe("The data to write to multiple ranges"),
          valueInputOption: z.enum(["RAW", "USER_ENTERED"]).optional().describe("How the input data should be interpreted")
        },
        handler: async ({ spreadsheetId, data, valueInputOption = "USER_ENTERED" }) => {
          try {
            const response = await sheets.spreadsheets.values.batchUpdate({
              spreadsheetId,
              resource: {
                valueInputOption,
                data
              }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Batch update completed successfully.
Spreadsheet ID: ${spreadsheetId}
Total updated cells: ${response.data.totalUpdatedCells}
Total updated ranges: ${response.data.totalUpdatedRanges}
Total updated rows: ${response.data.totalUpdatedRows}
Total updated columns: ${response.data.totalUpdatedColumns}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      }
    ];
