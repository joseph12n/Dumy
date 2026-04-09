/**
 * LLM Bridge - Abstract interface for local LLM inference
 * Supports both mock (for development) and ExecuTorch (Llama 3.2) for production
 */

export interface LLMOptions {
  maxTokens?: number; // default: 512
  temperature?: number; // default: 0.7
  stopSequences?: string[]; // default: ['</response>']
}

export interface LLMBridge {
  isAvailable(): boolean;
  generateResponse(prompt: string, options?: LLMOptions): Promise<string>;
  generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: LLMOptions,
  ): Promise<void>;
}

/**
 * Mock LLM implementation - generates realistic Spanish financial responses
 * Used during development before ExecuTorch module is integrated
 */
class MockLLMBridge implements LLMBridge {
  isAvailable(): boolean {
    return true;
  }

  async generateResponse(
    prompt: string,
    options?: LLMOptions,
  ): Promise<string> {
    // Simulate inference latency
    await new Promise((resolve) =>
      setTimeout(resolve, 1200),
    );

    // Generate a response based on context in the prompt
    const mockResponse = this.generateMockResponse(prompt);
    return mockResponse;
  }

  async generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: LLMOptions,
  ): Promise<void> {
    const response = await this.generateResponse(prompt, options);

    // Simulate streaming by emitting tokens
    const words = response.split(' ');
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms between words
      onToken(word + ' ');
    }
  }

  private generateMockResponse(prompt: string): string {
    // Simple heuristic: detect keywords in the prompt and respond appropriately
    const responses = [
      'Basándome en tus gastos de este mes, veo que has gastado más en Alimentación que en otras categorías. Te recomendaría revisar tus hábitos de compra en mercados y restaurantes. ¿Hay alguna forma de optimizar sin sacrificar la calidad?',

      'Tus gastos en transporte están dentro de lo normal. Sin embargo, si usas mucho TransMilenio o taxi, considera usar bicicleta algunos días para ahorrar dinero y mejorar tu salud.',

      'Excelente! Veo que este mes ahorrate más dinero que el anterior. Sigue así. ¿Tienes algún objetivo de ahorro a largo plazo? Podemos crear un plan juntos.',

      'Notó que tendiste a gastar más los fines de semana. Es común. Te sugiero preparar un presupuesto semanal para tener mejor control de tus ingresos y gastos.',

      'Tu ratio de ingresos vs gastos es saludable. Mantienes un balance positivo. ¿Quieres que te ayude a establecer un presupuesto para alguna categoría específica?',

      'He analizado tus transacciones recientes. Parece que estás en una buena posición financiera. ¿Hay algo específico en lo que pueda ayudarte? ¿Quieres consejos sobre presupuesto, ahorro, o inversión?',
    ];

    // Return a random response for development
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

/**
 * ExecuTorch LLM Bridge - Production implementation using Llama 3.2
 * This will integrate with the ExecuTorch native module when available
 */
class ExecuTorchLLMBridge implements LLMBridge {
  isAvailable(): boolean {
    // Check if NativeModules.ExecuTorchLlama is available
    // TODO: Update when native module is integrated
    // const { NativeModules } = require('react-native');
    // return typeof NativeModules.ExecuTorchLlama !== 'undefined';
    return false; // Disabled until native module is ready
  }

  async generateResponse(
    prompt: string,
    options?: LLMOptions,
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error(
        'ExecuTorchLlama native module not available. Install the module or use MockLLMBridge.',
      );
    }

    // TODO: Integrate with NativeModules.ExecuTorchLlama.generate()
    // const { NativeModules } = require('react-native');
    // const result = await NativeModules.ExecuTorchLlama.generate(
    //   prompt,
    //   options?.maxTokens || 512,
    //   options?.temperature || 0.7,
    // );
    // return result;

    throw new Error('ExecuTorchLlama integration not yet implemented');
  }

  async generateResponseStream(
    prompt: string,
    onToken: (token: string) => void,
    options?: LLMOptions,
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error(
        'ExecuTorchLlama native module not available. Install the module or use MockLLMBridge.',
      );
    }

    // TODO: Integrate with NativeModules.ExecuTorchLlama.generateStream()
    // const { NativeModules } = require('react-native');
    // await NativeModules.ExecuTorchLlama.generateStream(
    //   prompt,
    //   onToken,
    //   options?.maxTokens || 512,
    //   options?.temperature || 0.7,
    // );

    throw new Error('ExecuTorchLlama stream integration not yet implemented');
  }
}

/**
 * Factory function to create the appropriate LLM bridge
 * Tries ExecuTorch first, falls back to Mock
 */
function createLLMBridge(): LLMBridge {
  const executorch = new ExecuTorchLLMBridge();
  if (executorch.isAvailable()) {
    console.log('[LLMBridge] Using ExecuTorch backend');
    return executorch;
  }

  console.log('[LLMBridge] Using Mock backend (development)');
  return new MockLLMBridge();
}

// Singleton instance
export const llmBridge: LLMBridge = createLLMBridge();
