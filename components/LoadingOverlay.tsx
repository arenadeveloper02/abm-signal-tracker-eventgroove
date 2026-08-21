export default function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="ds-loader-overlay">
      <div className="ds-card flex items-center gap-3 px-8 py-6">
        <span className="ds-spinner" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}
