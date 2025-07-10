import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ConnectWallet } from '@/components/web3/connect-wallet'

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Lado esquerdo - Logo e navegação */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">GitFreelas</h1>
        </div>

        {/* Lado direito - Carteira */}
        <div className="flex items-center gap-4">
          <ConnectWallet
            variant="outline"
            size="sm"
            showBalance={true}
            showNetwork={true}
          />
        </div>
      </div>
    </header>
  )
}
