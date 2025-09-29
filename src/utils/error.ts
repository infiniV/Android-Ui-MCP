import { ADBCommandError } from '../types';

// Format error for MCP response
export function formatErrorForResponse(error: unknown): string {
  if (error instanceof ADBCommandError) {
    let message = `${error.code}: ${error.message}`;
    
    if (error.suggestion) {
      message += `\n\nSuggestion: ${error.suggestion}`;
    }
    
    return message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return String(error);
}

// Check if an error is recoverable
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof ADBCommandError) {
    switch (error.code) {
      case 'ADB_NOT_FOUND':
      case 'NO_DEVICES_FOUND':
      case 'DEVICE_NOT_FOUND':
        return false; // These require user action
      default:
        return true; // Others might be temporary issues
    }
  }
  
  return false;
}

// Get user-friendly error message
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ADBCommandError) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Get error suggestion
export function getErrorSuggestion(error: unknown): string | undefined {
  if (error instanceof ADBCommandError) {
    return error.suggestion;
  }
  
  return undefined;
}