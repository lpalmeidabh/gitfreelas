import { ConnectWallet } from '@/components/web3/connect-wallet'
import { Button } from '@/components/ui/button'
import { Bitcoin, Handshake } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="w-full flex min-h-screen flex-col items-center mt-[10rem] bg-background">
      <div className="container flex  flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
          git-freelas
        </h1>
        <div className=" w-full flex flex-col-reverse md:flex-row items-center gap-4 px-6 sm:px-0">
          <div className="flex flex-col gap-4 items-start justify-start  ">
            <p className="flex max-w-200 md:flex-col items-start gap-2 text-lg md:text-xl lg:text-3xl  text-left font-bold">
              <Handshake className="w-10 h-10 md:w-20 md:h-20" />
              Encontre profissionais freelancers ou oportunidades de freelas.
            </p>
            <p className="flex max-w-200 md:flex-col items-start  gap-2 text-lg md:text-xl lg:text-3xl  text-left font-bold">
              <Bitcoin className="w-10 h-10 md:w-20 md:h-20" />
              Pague e receba em cripto.
            </p>
          </div>
          <Image
            src="/hero.png"
            alt="Hero Image"
            width={500}
            height={300}
            className="flex justify-start "
          />
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline" size="lg">
              Login
            </Button>
          </Link>
          <ConnectWallet />
        </div>
      </div>
    </div>
  )
}
