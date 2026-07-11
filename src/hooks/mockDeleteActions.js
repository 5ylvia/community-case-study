import { mockHomemeals, mockMeetings, mockRecos } from "../mocks/data";

export async function deleteMeeting(id) {
  const idx = mockMeetings.findIndex((m) => m.id === id);
  if (idx >= 0) {
    mockMeetings[idx].cancelled = true;
    mockMeetings[idx].deleted_at = new Date().toISOString();
  }
}

export async function deleteHomemeal(id) {
  const idx = mockHomemeals.findIndex((h) => h.id === id);
  if (idx >= 0) {
    mockHomemeals[idx].cancelled = true;
    mockHomemeals[idx].deleted_at = new Date().toISOString();
  }
}

export async function deleteReco(id) {
  const idx = mockRecos.findIndex((r) => r.id === id);
  if (idx >= 0) {
    mockRecos[idx].deleted_at = new Date().toISOString();
  }
}
