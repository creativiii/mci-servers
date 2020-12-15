import React from 'react';
import Typography from 'components/typography';
import ServerCard from 'components/server/card';
import { useServers } from '../utils/hooks/data';

const { Title } = Typography;

const Home = (): JSX.Element => {
  const { data, isFetching } = useServers();
  return (
    <>
      <div className="mb-4">
        {/* eslint-disable-next-line react/jsx-curly-brace-presence */}
        <Title level={2}>{"I nostri server piu' poplari"}</Title>
      </div>
      {isFetching ? (
        'Loading...'
      ) : (
        <>
          {data.map((server) => (
            <ServerCard server={server} />
          ))}
        </>
      )}
    </>
  );
};

export default Home;
