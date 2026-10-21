export const dropdownStyles = {
  trigger: `
    flex items-center justify-between gap-2
    px-3 border rounded-lg bg-white h-10
    cursor-pointer transition-all
  `,

  triggerActive: `
    border-cyan-500 ring-2 ring-cyan-100/50
  `,

  triggerInactive: `
    border-gray-200 hover:border-cyan-500
  `,

  triggerDisabled: `
    opacity-40 cursor-not-allowed
    bg-gray-50 border-gray-200
  `,

  menu: `
    absolute top-11 left-0 right-0
    max-h-60 overflow-y-auto
    border border-gray-200
    bg-white rounded-xl
    z-50 shadow-xl
    p-1.5 flex flex-col gap-0.5
  `,

  item: `
    px-3 py-2 text-sm
    text-slate-600
    rounded-lg
    hover:bg-gray-50
    cursor-pointer
    font-inter
  `,

  valueSelected: `
    text-slate-700 font-medium
  `,

  valuePlaceholder: `
    text-slate-400
  `,

  arrow: `
    text-slate-400 transition-transform
  `,
};