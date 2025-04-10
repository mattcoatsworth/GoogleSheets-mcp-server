import { z } from 'zod';
    import { sheets, handleApiError } from '../auth.js';

    export const sheetTools = [
      {
        name: "copySheet",
        description: "Copies a sheet to another spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet containing the sheet to copy"),
          sheetId: z.number().describe("The ID of the sheet to copy"),
          destinationSpreadsheetId: z.string().describe("The ID of the spreadsheet to copy the sheet to")
        },
        handler: async ({ spreadsheetId, sheetId, destinationSpreadsheetId }) => {
          try {
            const response = await sheets.spreadsheets.sheets.copyTo({
              spreadsheetId,
              sheetId,
              resource: {
                destinationSpreadsheetId
              }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Sheet copied successfully.
Source Spreadsheet ID: ${spreadsheetId}
Source Sheet ID: ${sheetId}
Destination Spreadsheet ID: ${destinationSpreadsheetId}
New Sheet ID: ${response.data.sheetId}
New Sheet Index: ${response.data.sheetIndex}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "addSheet",
        description: "Adds a new sheet to a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet"),
          title: z.string().describe("The name of the new sheet"),
          index: z.number().optional().describe("The zero-based index where the new sheet should be inserted"),
          rowCount: z.number().optional().describe("The number of rows in the new sheet"),
          columnCount: z.number().optional().describe("The number of columns in the new sheet")
        },
        handler: async ({ spreadsheetId, title, index, rowCount = 1000, columnCount = 26 }) => {
          try {
            const requests = [{
              addSheet: {
                properties: {
                  title,
                  index,
                  gridProperties: {
                    rowCount,
                    columnCount
                  }
                }
              }
            }];
            
            const response = await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              resource: { requests }
            });
            
            const newSheet = response.data.replies[0].addSheet.properties;
            
            return {
              content: [{ 
                type: "text", 
                text: `Sheet added successfully.
Spreadsheet ID: ${spreadsheetId}
New Sheet Title: ${newSheet.title}
New Sheet ID: ${newSheet.sheetId}
Dimensions: ${newSheet.gridProperties.rowCount} rows x ${newSheet.gridProperties.columnCount} columns`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "deleteSheet",
        description: "Deletes a sheet from a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet"),
          sheetId: z.number().describe("The ID of the sheet to delete")
        },
        handler: async ({ spreadsheetId, sheetId }) => {
          try {
            const requests = [{
              deleteSheet: {
                sheetId
              }
            }];
            
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              resource: { requests }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Sheet deleted successfully.
Spreadsheet ID: ${spreadsheetId}
Deleted Sheet ID: ${sheetId}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "updateSheetProperties",
        description: "Updates the properties of a sheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet"),
          sheetId: z.number().describe("The ID of the sheet to update"),
          title: z.string().optional().describe("The new title for the sheet"),
          index: z.number().optional().describe("The new index for the sheet"),
          hidden: z.boolean().optional().describe("Whether the sheet should be hidden"),
          rightToLeft: z.boolean().optional().describe("Whether the sheet is displayed right-to-left"),
          gridProperties: z.object({
            rowCount: z.number().optional(),
            columnCount: z.number().optional(),
            frozenRowCount: z.number().optional(),
            frozenColumnCount: z.number().optional()
          }).optional().describe("Grid properties to update")
        },
        handler: async ({ spreadsheetId, sheetId, title, index, hidden, rightToLeft, gridProperties }) => {
          try {
            const properties = {
              sheetId,
              title,
              index,
              hidden,
              rightToLeft,
              gridProperties
            };
            
            // Remove undefined properties
            Object.keys(properties).forEach(key => 
              properties[key] === undefined && delete properties[key]
            );
            
            const requests = [{
              updateSheetProperties: {
                properties,
                fields: Object.keys(properties).join(',')
              }
            }];
            
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              resource: { requests }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Sheet properties updated successfully.
Spreadsheet ID: ${spreadsheetId}
Sheet ID: ${sheetId}
Updated properties: ${Object.keys(properties).filter(k => k !== 'sheetId').join(', ')}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      }
    ];
