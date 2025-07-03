import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowBigLeft, ArrowBigRight, Send } from 'lucide-react'
import { secFont } from '@/fonts'

export default function Home() {
  return (
    <div className="w-full flex min-h-screen flex-col items-center mt-[10rem] bg-background">
      <div className="container flex  flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
          git-freelas
        </h1>
        <div className=" w-full flex flex-col-reverse md:flex-row  justify-center items-center gap-4">
          <p className="flex flex-col flex-1 gap-8 md:gap-4 text-lg md:text-xl lg:text-2xl text-left">
            Encontre profissionais freelancers ou oportunidades de freelas.
          </p>
          <p className="flex flex-col flex-1 gap-8 md:gap-4 text-lg md:text-xl lg:text-2xl text-left">
            Pague e receba em cripto.
          </p>
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
        </div>
      </div>
    </div>
  )
}
