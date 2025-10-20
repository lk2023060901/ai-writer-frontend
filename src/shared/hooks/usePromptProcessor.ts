import { useMemo } from 'react';

interface UsePromptProcessorProps {
  prompt: string;
  modelName?: string;
}

export const usePromptProcessor = ({ prompt, modelName }: UsePromptProcessorProps): string => {
  return useMemo(() => {
    // Simple prompt processing - replace variables if needed
    let processed = prompt;

    // You can add more processing logic here
    // For example: replace {{model}} with actual model name
    if (modelName) {
      processed = processed.replace(/\{\{model\}\}/g, modelName);
    }

    // Replace common variables
    processed = processed.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
    processed = processed.replace(/\{\{time\}\}/g, new Date().toLocaleTimeString());

    return processed;
  }, [prompt, modelName]);
};
