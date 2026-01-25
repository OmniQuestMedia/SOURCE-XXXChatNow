import PerformerGrid from '@components/performer/performer-grid';
import {
  searchPerformer,
  updatePerformerFavourite,
  updatePerformerStatus,
  updatePerformerStreamingStatus
} from '@redux/performer/actions';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import type { Router } from 'next/router';
import { withRouter } from 'next/router';
import {
  useContext, useEffect, useState
} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { IBanner } from 'src/interfaces';
import {
  bannerService, featuredCreatorPackageService,
  settingService
} from 'src/services';
import { SocketContext } from 'src/socket';

const SeoMetaHead = dynamic(() => import('@components/common/seo-meta-head'));
// const PerformerGrid = dynamic(() => import('@components/performer/performer-grid'), { ssr: false });
const PerformerFilter = dynamic(() => import('@components/user/performer-filter'));

const mapStates = (state: any) => ({
  countries: state.settings.countries,
  loggedIn: state.auth.loggedIn,
  categories: state.performer.categories.data,
  settings: state.settings,
  performers: state.performer.performers
});

const mapDispatch = {
  dispatchSearchPerformer: searchPerformer,
  dispatchUpdatePerformerFavorite: updatePerformerFavourite,
  dispatchUpdatePerformerStreamingStatus: updatePerformerStreamingStatus,
  dispatchUpdatePerformerStatus: updatePerformerStatus
};

const connector = connect(mapStates, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

type PopsMeta = {
  homeTitle: string;
  metaKeywords: string;
  metaDescription: string;
  banners: IBanner[];
  userUrl: string;
};

type PropsWithRouter = {
  router: Router
}

function LandingPage({
  homeTitle,
  metaKeywords,
  metaDescription,
  userUrl,
  banners,
  countries,
  categories,
  performers,
  dispatchSearchPerformer,
  dispatchUpdatePerformerStreamingStatus,
  dispatchUpdatePerformerStatus,
  router
}: PopsMeta & PropsFromRedux & PropsWithRouter) {
  const initQueryState = {
    offset: 0,
    limit: 60,
    gender: '',
    category: '',
    country: '',
    sortBy: '',
    sort: 'desc'
  };
  const { socketStatus, connected, getSocket } = useContext(SocketContext);
  const [filterQuery, setFilterQuery] = useState(initQueryState);
  const [featuredList, setFeaturedList] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await featuredCreatorPackageService.getApprovedFeatureCreatorListings({ limit: 100 });
        const result = res.data.data.reduce((obj, value) => ({
          ...obj,
          [value.packageId]: {
            name: value.package.name,
            performers: obj[value.packageId] ? [...obj[value.packageId].performers, value.performer] : [value.performer]
          }
        }), {});

        setFeaturedList(result);

        // eslint-disable-next-line no-empty
      } catch (e) {
        // console.log(e);
      }
    })();
  }, []);

  const search = debounce(() => {
    dispatchSearchPerformer({
      ...filterQuery,
      ...router.query
    });
  }, 100);

  const setFilter = (name: string, value: any) => {
    setFilterQuery({
      ...filterQuery,
      [name]: value
    });
  };

  const clearFilter = () => {
    setFilterQuery(initQueryState);
  };

  const handleUpdateStreamingStatus = (data: any) => {
    dispatchUpdatePerformerStreamingStatus(data);
  };

  const handleUpdatePerformerStatus = (data: any) => {
    dispatchUpdatePerformerStatus(data);
  };

  const handleSocketConnect = () => {
    const socket = getSocket();
    if (socket) {
      // TODO - recheck this logi
      socket.on('modelUpdateStatus', (data) => handleUpdatePerformerStatus(data));
      socket.on('modelUpdateStreamingStatus', (data) => handleUpdateStreamingStatus(data));
    }
  };

  const handleSocketDisconnect = () => {
    const socket = getSocket();
    if (socket) {
      socket.off('modelUpdateStatus', {});
      socket.off('modelUpdateStreamingStatus', (data) => handleUpdatePerformerStatus(data));
    }
  };

  useEffect(() => {
    if (!connected()) return handleSocketDisconnect();

    handleSocketConnect();

    return handleSocketDisconnect;
  }, [socketStatus]);

  useEffect(() => {
    search();
  }, [router.query.q]);

  useEffect(() => {
    search();
  }, [filterQuery]);

  return (
    <div className="homepage">
      <SeoMetaHead
        pageTitle={homeTitle}
        description={metaDescription}
        keywords={metaKeywords}
        canonicalLink={userUrl}
      />
      {Object.keys(featuredList).map((key) => (
        <div>
          <PerformerGrid
            title={featuredList[key].name}
            isPage
            success
            data={featuredList[key].performers}
            total={featuredList[key].performers.length}
          />
        </div>
      ))}
      <PerformerFilter
        countries={countries}
        categories={categories}
        setFilter={setFilter}
        clearFilter={clearFilter}
        {...filterQuery}
      />
      <PerformerGrid
        title="Live cams"
        isPage
        banners={banners}
        setFilter={setFilter}
        {...performers}
        {...filterQuery}
      />
    </div>
  );
}

LandingPage.getInitialProps = async () => {
  try {
    const [metaSettings, bannerResp] = await Promise.all([
      settingService.valueByKeys(['metaKeywords', 'metaDescription', 'homeTitle', 'userUrl']),
      bannerService.search()
    ]);
    const meta = metaSettings.data;
    return {
      homeTitle: meta.homeTitle || 'Home',
      metaKeywords: meta.metaKeywords || '',
      metaDescription: meta.metaDescription || '',
      banners: bannerResp.data?.data || [],
      userUrl: meta.userUrl
    };
  } catch (e) {
    return {
      homeTitle: '',
      metaKeywords: '',
      metaDescription: '',
      banners: [],
      userUrl: ''
    };
  }
};

export default connector(withRouter(LandingPage));
