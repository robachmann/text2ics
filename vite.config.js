import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    base: "/text2ics/",
    plugins: [react()],
});
