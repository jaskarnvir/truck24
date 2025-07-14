import { LoadingAnimation } from "@/components/ui/loading-animation"

export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <LoadingAnimation size="lg" />
    </div>
  )
}
