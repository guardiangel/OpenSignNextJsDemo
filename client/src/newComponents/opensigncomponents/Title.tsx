import { Helmet } from "react-helmet";

function Title({ title, drive }) {
  return (
    <Helmet>
      <title>{drive ? title : `${title} - EducationCa™`}</title>
      <meta name="description" content={`${title} - EducationCa™`} />
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
