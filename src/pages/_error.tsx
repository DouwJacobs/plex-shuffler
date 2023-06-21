import PageTitle from "@app/components/Common/PageTitle";
import type { Undefinable } from "@app/utils/typeHelpers";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import type { NextPage } from "next";
import Link from "next/link";

interface ErrorProps {
  statusCode?: number;
}

const messages = {
  errormessagewithcode: "{statusCode} - {error}",
  internalservererror: "Internal Server Error",
  serviceunavailable: "Service Unavailable",
  somethingwentwrong: "Something Went Wrong",
  oops: "Oops",
  returnHome: "Return Home",
};

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  const getErrorMessage = (statusCode?: number) => {
    switch (statusCode) {
      case 500:
        return messages.internalservererror;
      case 503:
        return messages.serviceunavailable;
      default:
        return statusCode ? messages.somethingwentwrong : messages.oops;
    }
  };
  return (
    <div className="error-message">
      <PageTitle title={getErrorMessage(statusCode)} />
      <div className="text-4xl">
        {statusCode
          ? statusCode + " - " + getErrorMessage(statusCode)
          : getErrorMessage(statusCode)}
      </div>
      <Link href="/" className="mt-2 flex">
        {messages.returnHome}
        <ArrowRightCircleIcon className="ml-2 h-6 w-6" />
      </Link>
    </div>
  );
};

Error.getInitialProps = async ({ res, err }): Promise<ErrorProps> => {
  // Apologies for how gross ternary is but this is just temporary. Honestly,
  // blame the nextjs docs
  let statusCode: Undefinable<number>;
  if (res) {
    statusCode = res.statusCode;
  } else {
    statusCode = err ? err.statusCode : undefined;
  }

  return { statusCode };
};

export default Error;
