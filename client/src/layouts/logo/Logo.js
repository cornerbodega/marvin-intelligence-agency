import Image from "next/image";
import Link from "next/link";
import LogoDark from "../../../public/logo.png";

const Logo = () => {
  return (
    <Link href="/reports/folders/view-folders">
      <Image height="175" width="175" src={LogoDark} alt="logo" />
    </Link>
  );
};

export default Logo;
