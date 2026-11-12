// Registra o loader do seed (ver seed-loader.mjs).
import { register } from 'node:module';

register(new URL('./seed-loader.mjs', import.meta.url));
