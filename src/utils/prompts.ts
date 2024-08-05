import { prompts } from "..";

export const samplePrompts = (): string => {
    return prompts[Math.floor(Math.random() * prompts.length)];
}
