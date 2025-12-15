import { defineStore } from 'pinia';

export const useFeatureStore = defineStore('feature', {
    state: () => ({
        screenshotModeEnabled: false,
    }),
    actions: {
        toggleScreenshotMode() {
            this.screenshotModeEnabled = !this.screenshotModeEnabled;
        },
    },
});

