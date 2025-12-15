import { defineStore } from 'pinia';

export const useMediaPopupStore = defineStore('mediaPopup', {
    state: () => ({
        uris: [],
        text: '',
        selectedIndex: 0,
        visible: false,
    }),
    actions: {
        showMediaPopup(uris, text) {
            this.uris = uris.filter((uri) => uri && uri.trim() !== '');
            this.text = text;
            this.selectedIndex = 0;
            this.visible = true;
        },
        hideMediaPopup() {
            this.visible = false;
            this.uris = [];
            this.text = '';
            this.selectedIndex = 0;
        },
        setSelectedIndex(index) {
            if (index >= 0 && index < this.uris.length) {
                this.selectedIndex = index;
            }
        },
        next() {
            if (this.selectedIndex < this.uris.length - 1) {
                this.selectedIndex++;
            }
        },
        previous() {
            if (this.selectedIndex > 0) {
                this.selectedIndex--;
            }
        },
    },
});

