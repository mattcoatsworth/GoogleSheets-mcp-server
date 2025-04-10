import { z } from 'zod';
    import { sheets, handleApiError } from '../auth.js';

    export const developerMetadataTools = [
      {
        name: "getDeveloperMetadata",
        description: "Gets all developer metadata for a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet to retrieve metadata from")
        },
        handler: async ({ spreadsheetId }) => {
          try {
            const response = await sheets.spreadsheets.developerMetadata.search({
              spreadsheetId,
              resource: {
                dataFilters: [{}] // Empty filter to get all metadata
              }
            });
            
            const matchedMetadata = response.data.matchedDeveloperMetadata || [];
            
            if (matchedMetadata.length === 0) {
              return {
                content: [{ type: "text", text: "No developer metadata found in this spreadsheet." }]
              };
            }
            
            let resultText = `Found ${matchedMetadata.length} developer metadata items:\n\n`;
            
            matchedMetadata.forEach((item, i) => {
              const metadata = item.developerMetadata;
              resultText += `Metadata ${i+1}:\n`;
              resultText += `- ID: ${metadata.metadataId}\n`;
              resultText += `- Key: ${metadata.metadataKey}\n`;
              resultText += `- Value: ${metadata.metadataValue}\n`;
              resultText += `- Visibility: ${metadata.visibility}\n`;
              
              if (metadata.location.spreadsheet) {
                resultText += `- Location: Spreadsheet level\n`;
              } else if (metadata.location.sheetId) {
                resultText += `- Location: Sheet (ID: ${metadata.location.sheetId})\n`;
              } else if (metadata.location.dimensionRange) {
                const dr = metadata.location.dimensionRange;
                resultText += `- Location: Dimension Range (Sheet ID: ${dr.sheetId}, Dimension: ${dr.dimension}, Start: ${dr.startIndex}, End: ${dr.endIndex})\n`;
              }
              
              resultText += '\n';
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
        name: "createDeveloperMetadata",
        description: "Creates developer metadata for a spreadsheet",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet"),
          metadataKey: z.string().describe("The key of the developer metadata"),
          metadataValue: z.string().describe("The value of the developer metadata"),
          location: z.object({
            type: z.enum(["SPREADSHEET", "SHEET", "ROW", "COLUMN", "CELL"]).describe("The type of location"),
            sheetId: z.number().optional().describe("The ID of the sheet (required for SHEET, ROW, COLUMN, CELL)"),
            rowIndex: z.number().optional().describe("The row index (required for ROW, CELL)"),
            columnIndex: z.number().optional().describe("The column index (required for COLUMN, CELL)")
          }).describe("The location where the metadata should be created"),
          visibility: z.enum(["DOCUMENT", "PROJECT"]).optional().describe("The visibility of the developer metadata")
        },
        handler: async ({ spreadsheetId, metadataKey, metadataValue, location, visibility = "DOCUMENT" }) => {
          try {
            let locationObject = {};
            
            switch (location.type) {
              case "SPREADSHEET":
                locationObject = { spreadsheet: true };
                break;
              case "SHEET":
                locationObject = { sheetId: location.sheetId };
                break;
              case "ROW":
                locationObject = { 
                  dimensionRange: {
                    sheetId: location.sheetId,
                    dimension: "ROWS",
                    startIndex: location.rowIndex,
                    endIndex: location.rowIndex + 1
                  }
                };
                break;
              case "COLUMN":
                locationObject = { 
                  dimensionRange: {
                    sheetId: location.sheetId,
                    dimension: "COLUMNS",
                    startIndex: location.columnIndex,
                    endIndex: location.columnIndex + 1
                  }
                };
                break;
              case "CELL":
                locationObject = { 
                  gridRange: {
                    sheetId: location.sheetId,
                    startRowIndex: location.rowIndex,
                    endRowIndex: location.rowIndex + 1,
                    startColumnIndex: location.columnIndex,
                    endColumnIndex: location.columnIndex + 1
                  }
                };
                break;
            }
            
            const requests = [{
              createDeveloperMetadata: {
                developerMetadata: {
                  metadataKey,
                  metadataValue,
                  location: locationObject,
                  visibility
                }
              }
            }];
            
            const response = await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              resource: { requests }
            });
            
            const metadataId = response.data.replies[0].createDeveloperMetadata.developerMetadata.metadataId;
            
            return {
              content: [{ 
                type: "text", 
                text: `Developer metadata created successfully.
Spreadsheet ID: ${spreadsheetId}
Metadata ID: ${metadataId}
Key: ${metadataKey}
Value: ${metadataValue}
Location Type: ${location.type}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "updateDeveloperMetadata",
        description: "Updates existing developer metadata",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet"),
          metadataId: z.number().describe("The ID of the metadata to update"),
          metadataKey: z.string().optional().describe("The new key for the metadata"),
          metadataValue: z.string().optional().describe("The new value for the metadata"),
          visibility: z.enum(["DOCUMENT", "PROJECT"]).optional().describe("The new visibility for the metadata")
        },
        handler: async ({ spreadsheetId, metadataId, metadataKey, metadataValue, visibility }) => {
          try {
            const fields = [];
            const developerMetadata = { metadataId };
            
            if (metadataKey !== undefined) {
              developerMetadata.metadataKey = metadataKey;
              fields.push('metadataKey');
            }
            
            if (metadataValue !== undefined) {
              developerMetadata.metadataValue = metadataValue;
              fields.push('metadataValue');
            }
            
            if (visibility !== undefined) {
              developerMetadata.visibility = visibility;
              fields.push('visibility');
            }
            
            const requests = [{
              updateDeveloperMetadata: {
                developerMetadata,
                fields: fields.join(',')
              }
            }];
            
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              resource: { requests }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Developer metadata updated successfully.
Spreadsheet ID: ${spreadsheetId}
Metadata ID: ${metadataId}
Updated fields: ${fields.join(', ')}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      },
      {
        name: "deleteDeveloperMetadata",
        description: "Deletes developer metadata",
        schema: {
          spreadsheetId: z.string().describe("The ID of the spreadsheet"),
          metadataId: z.number().describe("The ID of the metadata to delete")
        },
        handler: async ({ spreadsheetId, metadataId }) => {
          try {
            const requests = [{
              deleteDeveloperMetadata: {
                developerId: metadataId
              }
            }];
            
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              resource: { requests }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Developer metadata deleted successfully.
Spreadsheet ID: ${spreadsheetId}
Metadata ID: ${metadataId}`
              }]
            };
          } catch (error) {
            return handleApiError(error);
          }
        }
      }
    ];
