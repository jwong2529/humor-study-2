import CRUDComponent from '@/components/CRUDComponent'

export default function Page() {
  return (
    <main className="p-8 max-w-7xl mx-auto">
      <CRUDComponent tableKey="terms" />
    </main>
  )
}
