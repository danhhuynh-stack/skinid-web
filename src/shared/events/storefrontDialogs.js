export function openConsultationDialog() {
  document.dispatchEvent(new CustomEvent('skinid:consultation-open'));
}

export function openPolicyDialog(policy) {
  document.dispatchEvent(new CustomEvent('skinid:policy-open', { detail: { policy } }));
}
