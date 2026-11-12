// Loader do seed: os mocks do front usam imports sem extensão ("./photos",
// estilo Vite/bundler). O Node puro exige a extensão, então este hook tenta
// completar com .js quando o módulo não é encontrado.
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' && !specifier.endsWith('.js') && specifier.startsWith('.')) {
      return next(`${specifier}.js`, context);
    }
    throw error;
  }
}
