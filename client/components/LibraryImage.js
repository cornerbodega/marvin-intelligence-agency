import Image from "next/image";
export default function LibraryImage() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "auto",
            height: "337px",
            textAlign: "center",
          }}
        >
          <Image src="/library.png" fill={true} />
        </div>
      </div>
    </div>
  );
}
