import { useContext } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const GuestRoute = ({ children }) => {
  const { token } = useContext(AppContext);

  return !token ? children : <Navigate to="/" replace />;
};

GuestRoute.propTypes = {
    children: PropTypes.node.isRequired,
};


export default GuestRoute;