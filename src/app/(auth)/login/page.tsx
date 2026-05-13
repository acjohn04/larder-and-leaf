import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Image from "next/image"

export default async function LoginPage() {
    const session = await auth()
    if (session?.user) {
        redirect("/")
    }

    return (
        <div className="bg-surface-container-low p-8 md:p-12 rounded-[3rem] border-ghost max-w-md w-full text-center shadow-ambient-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
                <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-md" />
                <span className="text-2xl font-bold tracking-tight text-primary font-display">Larder & Leaf</span>
            </div>
            <h1 className="text-3xl font-extrabold font-display text-on-surface mb-2">Welcome back</h1>
            <p className="text-on-surface-variant mb-8">Sign in to access your digital pantry.</p>

            <div className="space-y-4">
                <form
                    action={async () => {
                        "use server"
                        await signIn("google")
                    }}
                >
                    <button type="submit" className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-6 py-4 rounded-full font-bold shadow-sm hover:bg-surface-container hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-3">
                        <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-6 h-6" />
                        Continue with Google
                    </button>
                </form>

                <form
                    action={async () => {
                        "use server"
                        await signIn("github")
                    }}
                >
                    <button type="submit" className="w-full bg-[#24292e] text-white px-6 py-4 rounded-full font-bold shadow-sm hover:bg-[#2c3238] hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-3">
                        <img src="https://authjs.dev/img/providers/github.svg" alt="GitHub" className="w-6 h-6 invert" />
                        Continue with GitHub
                    </button>
                </form>
            </div>
        </div>
    )
}
