import { Helmet } from "react-helmet";

function Title({ title, drive }) {
  return (
    <Helmet>
      <title>{drive ? title : `${title} - VassuTech™`}</title>
      <meta name="description" content={`${title} - VassuTech™`} />
      <link
        rel="icon"
        type="image/png"
        href={localStorage.getItem("fev_Icon")!}
        sizes="40x40"
      />
    </Helmet>
  );
}

export default Title;
