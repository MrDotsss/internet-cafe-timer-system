import { ref } from "vue";

export function useBackendTest() {
  const status = ref(null);

  async function fetchStatus() {
    const s = await window.adminApi.getStatus();
    status.value = s;
  }

  return { status, fetchStatus };
}
