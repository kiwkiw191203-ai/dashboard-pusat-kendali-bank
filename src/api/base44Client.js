// App asli Base44 sudah dihapus, jadi dashboard berjalan penuh secara lokal:
// seluruh data disimpan di browser (localStorage), tanpa server.
import { createClient } from "./localClient";

export const base44 = createClient();
