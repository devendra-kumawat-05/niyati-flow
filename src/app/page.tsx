import Image from "next/image";

export default function Home() {
  return (
    <main>
      <h1>Hello! from Niyati Flow</h1>
      <Image src="/logo.svg" alt="Niyati Flow Logo" width={100} height={24} />
    </main>
  );
}
