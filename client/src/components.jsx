import { css } from "@emotion/css";
import { useTheme, createTheme } from "@mui/material/styles";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isDemo } from "./runtime.js";
import {
  Container,
  Grid,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  Menu,
  Button,
  useMediaQuery,
  Avatar,
  Modal,
  Autocomplete,
  TextField,
} from "@mui/material";
import DraftsIcon from "@mui/icons-material/Drafts";
import SchoolIcon from "@mui/icons-material/School";
import HomeIcon from "@mui/icons-material/Home";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import DescriptionIcon from "@mui/icons-material/Description";
import NotListedLocationIcon from "@mui/icons-material/NotListedLocation";
import MenuIcon from "@mui/icons-material/Menu";
import {
  centerAddress,
  avatarUrl,
  loginUser,
  logoutUser,
  signUp,
} from "./store.js";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import { connect } from "react-redux";
import StarIcon from "@mui/icons-material/Star";
/* StyleHelpers */
function createStyles(styles) {
  return function useStyles() {
    const theme = useTheme();
    const rules = typeof styles === "function" ? styles(theme) : styles;
    return Object.fromEntries(
      Object.entries(rules).map(([key, value]) => [key, css(value)]),
    );
  };
}
/* Footer */
const useFooterStyles = createStyles({
  footer: {
    // position: "fixed",
    margin: "0px auto",
    padding: "20px 0px",
    bottom: "0",
    width: "100%",
  },
});
const Footer = () => {
  const classes = useFooterStyles();
  return (
    <Box className={classes.footer} sx={{ backgroundColor: "#6fa8bf" }}>
      <Container maxWidth="lg">
        <Grid
          container
          spacing={0}
          direction="row"
          sx={{ justifyContent: "center" }}
        >
          <Grid size={{ xs: 6 }}>
            <Grid
              container
              spacing={0}
              direction="row"
              sx={{ justifyContent: "center" }}
            >
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" align="center">
                  Link
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <List component="nav" aria-label="main mailbox folders">
                  <Link to="/home" style={{ color: "black" }}>
                    <ListItemButton>
                      <ListItemIcon>
                        <HomeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Home" />
                    </ListItemButton>
                  </Link>

                  <Link to="/studentList" style={{ color: "black" }}>
                    <ListItemButton>
                      <ListItemIcon>
                        <PermIdentityIcon />
                      </ListItemIcon>

                      <ListItemText primary="Student" />
                    </ListItemButton>
                  </Link>
                </List>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <List component="nav" aria-label="main mailbox folders">
                  <Link to="/teacherList" style={{ color: "black" }}>
                    <ListItemButton>
                      <ListItemIcon>
                        <SchoolIcon />
                      </ListItemIcon>
                      <ListItemText primary="Teacher" />
                    </ListItemButton>
                  </Link>

                  <Link to="/courses" style={{ color: "black" }}>
                    <ListItemButton>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText primary="Courses" />
                    </ListItemButton>
                  </Link>
                </List>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <List component="nav" aria-label="main mailbox folders">
                  <Link to="/addresses" style={{ color: "black" }}>
                    <ListItemButton>
                      <ListItemIcon>
                        <NotListedLocationIcon />
                      </ListItemIcon>
                      <ListItemText primary="Addresses" />
                    </ListItemButton>
                  </Link>
                </List>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Grid
              container
              spacing={0}
              direction="row"
              sx={{ justifyContent: "center" }}
            >
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" align="center">
                  Address
                </Typography>
                <Typography variant="body1" align="center">
                  {centerAddress}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "center", paddingTop: "20px" }}>
          Tutur Information Management {new Date().getFullYear()}
        </Box>
      </Container>
    </Box>
  );
};
/* Header */
const selectHeaderState = (state) => {
  return { auth: state.auth, profiles: state.profiles };
};
const headerActions = (dispatch) => ({
  signUp: (creds) => dispatch(signUp(creds)),
  loginUser: (creds) => dispatch(loginUser(creds)),
  logoutUser: () => dispatch(logoutUser()),
});
const useHeaderStyles = createStyles((theme) => ({
  root: { flexGrow: 1, paddingBottom: "65px" },
  menuButton: {
    color: theme.palette.primary.dark,
    backgroundColor: "transparent",
  },
  title: { justifyContent: "space-between" },
  headerOptions: { display: "flex", flex: 1, justifyContent: "flex-start" },
  navButton: {
    "&:hover": {
      backgroundColor: "theme.palette.primary.dark",
      textDecoration: "none",
    },
    color: "#000000",
  },
  menuPaper: {
    "& .MuiPaper-root": { backgroundColor: theme.palette.primary.light },
  },
  customWidth: {
    "& li": { width: "300px" },
    "&:hover": {
      backgroundColor: "theme.palette.primary.dark",
      textDecoration: "none",
    },
    color: "#000000",
  },
  username: {
    color: "#000000",
    fontWeight: "bold",
    fontFamily: "Roboto",
    marginRight: "15px",
  },
}));
const HeaderHeaderComponent = React.forwardRef((props, ref) => {
  const classes = useHeaderStyles();
  const history = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openModal, setOpenModal] = useState(false);
  const [modalSignUp, setModalSU] = useState(false);
  const { profiles, SignInForm, SignUpForm, onSwitchUI } = props;
  const [username, setusername] = useState("");
  const [imgPath, setimgPath] = useState("");
  const [profileRoute, setprofileRoute] = useState("");
  let navRouteInit = [
    { link: "/home", nameLink: "Home", icon: <HomeIcon /> },
    { link: "/studentList", nameLink: "Student", icon: <PermIdentityIcon /> },
    { link: "/teacherList", nameLink: "Teacher", icon: <SchoolIcon /> },
    { link: "/courses", nameLink: "Courses", icon: <DescriptionIcon /> },
    {
      link: "/addresses",
      nameLink: "Addresses",
      icon: <NotListedLocationIcon />,
    },
  ];
  const [navRoute, setNavRoute] = useState(navRouteInit);
  useEffect(() => {
    if (profiles.profiles) {
      if (profiles.profiles.admin) {
        const temp = {
          link: "/admin/view",
          nameLink: "Admin",
          icon: <PlaylistAddCheckIcon />,
        };
        setNavRoute([...navRouteInit, temp]);
      }
      if (profiles.profiles.isTeacher) {
        setusername(profiles.profiles.teacherProfile.name);
        setimgPath(profiles.profiles.teacherProfile.imgPath);
        setprofileRoute("/profile/teacher");
      } else if (profiles.profiles.isStudent) {
        setusername(profiles.profiles.studentProfile.name);
        setimgPath(profiles.profiles.studentProfile.imgPath);
        setprofileRoute("/profile/student");
      }
      setOpenModal(false);
      setModalSU(false);
    } else if (profiles.profiles === null) {
      setNavRoute(navRouteInit);
      setusername("");
      setimgPath("");
      setprofileRoute("");
    }
  }, [profiles]);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleLogout = () => {
    props.logoutUser();
    return history("/home");
  };
  const switchModal = () => {
    if (openModal) {
      setModalSU(true);
      return setOpenModal(false);
    } else {
      setOpenModal(true);
      return setModalSU(false);
    }
  };
  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar className={classes.title}>
          {/* <Avatar alt="logo" src="/assets/images/download.png" variant="square" /> */}
          {isMobile ? (
            <>
              <IconButton
                className={classes.menuButton}
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                open={open}
                onClose={() => setAnchorEl(null)}
                className={classes.menuPaper}
              >
                {navRoute.map((item, index) => {
                  const { link, nameLink } = item;
                  return (
                    <Link to={link} key={index} className={classes.customWidth}>
                      <MenuItem sx={{ fontWeight: "bold" }}>
                        {nameLink}
                      </MenuItem>
                    </Link>
                  );
                })}
                {!props.auth.isAuthenticated ? (
                  <MenuItem
                    onClick={() => setOpenModal(true)}
                    disabled={isDemo}
                  >
                    Sign In
                    {props.auth.isFetching ? (
                      <span className="fa fa-spinner fa-pulse fa-fw"></span>
                    ) : null}
                  </MenuItem>
                ) : (
                  <>
                    <Link to={profileRoute ? profileRoute : ""}>
                      <MenuItem>
                        <Typography variant="body1">Your Profile</Typography>
                      </MenuItem>
                    </Link>

                    <MenuItem onClick={handleLogout}>
                      Sign Out
                      {props.auth.isFetching ? (
                        <span className="fa fa-spinner fa-pulse fa-fw"></span>
                      ) : null}
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          ) : (
            <>
              <div className={classes.headerOptions}>
                {navRoute.map((item, index) => {
                  const { link, nameLink, icon } = item;
                  return (
                    <Link to={link} key={index} className={classes.navButton}>
                      <Button variant="text">
                        {icon} {nameLink}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              {!props.auth.isAuthenticated ? (
                <Button
                  variant="contained"
                  onClick={() => setOpenModal(true)}
                  disabled={isDemo}
                  color="secondary"
                  className={classes.navButton}
                >
                  Sign In
                  {props.auth.isFetching ? (
                    <span className="fa fa-spinner fa-pulse fa-fw"></span>
                  ) : null}
                </Button>
              ) : (
                <>
                  <Link to={profileRoute ? profileRoute : ""}>
                    <Grid
                      container
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <Grid>
                        <Avatar alt="avatar" src={avatarUrl + imgPath} />
                      </Grid>
                      <Grid>
                        <Typography variant="h6" className={classes.username}>
                          {username ? username : null}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="contained"
                    color="secondary"
                  >
                    Sign Out
                    {props.auth.isFetching ? (
                      <span className="fa fa-spinner fa-pulse fa-fw"></span>
                    ) : null}
                  </Button>
                </>
              )}
            </>
          )}
          <Button
            onClick={onSwitchUI}
            variant="outlined"
            sx={{ ml: 1, flexShrink: 0, fontSize: { xs: 12, sm: 14 } }}
          >
            Modern UI
          </Button>
        </Toolbar>
      </AppBar>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <SignInForm
          loginUser={props.loginUser}
          setOpenModal={() => setOpenModal()}
          switchModal={switchModal}
        />
      </Modal>

      <Modal
        open={modalSignUp}
        onClose={() => {
          setModalSU(false);
        }}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <SignUpForm
          signUp={props.signUp}
          setModalSU={() => setModalSU()}
          switchModal={switchModal}
        />
      </Modal>
    </div>
  );
});
const Header = connect(selectHeaderState, headerActions)(HeaderHeaderComponent);
/* Loading */
const Loading = () => {
  return (
    <div className="col-12" style={{ textAlign: "center", height: "100vh" }}>
      <span className="fa fa-spinner fa-pulse fa-3x fa-fw text-primary"></span>
      <p>Loading . . .</p>
    </div>
  );
};
/* ImageUploader */
function ImageUploader({
  onChange,
  buttonText = "Choose image",
  maxFileSize = 1048576,
  withPreview = true,
}) {
  const [file, setFile] = useState(null),
    [error, setError] = useState(""),
    [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      {withPreview && url && (
        <img
          src={url}
          alt="Selected image preview"
          style={{
            maxWidth: "100%",
            maxHeight: 150,
            display: "block",
            margin: "0 auto 12px",
          }}
        />
      )}
      <Button component="label" variant="contained" color="primary">
        {buttonText}
        <input
          type="file"
          hidden
          accept="image/png,image/jpeg,image/gif"
          onChange={(event) => {
            const next = event.target.files?.[0];
            if (!next) return;
            if (
              !["image/png", "image/jpeg", "image/gif"].includes(next.type) ||
              next.size > maxFileSize
            ) {
              setError("Choose a PNG, JPG or GIF image smaller than 1 MB.");
              event.target.value = "";
              return;
            }
            setError("");
            setFile(next);
            onChange?.([next]);
          }}
        />
      </Button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
/* InfiniteScroll */
function InfiniteScroll({
  children,
  next,
  hasMore,
  dataLength,
  loader,
  endMessage,
}) {
  const sentinel = useRef(null),
    pending = useRef(false),
    callback = useRef(next);
  callback.current = next;
  useEffect(() => {
    pending.current = false;
  }, [dataLength]);
  useEffect(() => {
    if (!hasMore || !sentinel.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !pending.current) {
          pending.current = true;
          callback.current();
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, dataLength]);
  return (
    <div>
      {children}
      {hasMore ? <div ref={sentinel}>{loader}</div> : endMessage}
    </div>
  );
}
/* Multiselect */
function Multiselect({
  options = [],
  selectedValues,
  displayValue = "name",
  placeholder,
  onSelect,
  onRemove,
}) {
  const [value, setValue] = useState(selectedValues || []);
  const selectedKey = JSON.stringify(selectedValues);
  useEffect(() => {
    if (selectedValues) setValue(selectedValues);
  }, [selectedKey]);
  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      disableCloseOnSelect
      getOptionLabel={(item) => String(item[displayValue] ?? item)}
      isOptionEqualToValue={(a, b) => a[displayValue] === b[displayValue]}
      onChange={(_, next, reason) => {
        setValue(next);
        onSelect?.(next);
        if (reason === "removeOption" || reason === "clear") onRemove?.(next);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={value.length ? "" : placeholder}
          aria-label={placeholder}
          variant="outlined"
        />
      )}
      sx={{ minWidth: 0, "& .MuiOutlinedInput-root": { minHeight: 54 } }}
    />
  );
}
/* StarRating */
function StarRating({ rating }) {
  const value = Number(rating) || 0;
  return (
    <span
      aria-label={`${value} out of 5 stars`}
      style={{ display: "inline-flex" }}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          sx={{
            width: 25,
            height: 25,
            fill: index + 1 <= value ? "#ffc107" : "#e4e5e9",
          }}
        />
      ))}
    </span>
  );
}
/* theme */
const theme = createTheme({
  components: { MuiButton: { defaultProps: { color: "inherit" } } },
  breakpoints: { values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 } },
  palette: {
    primary: { main: "#67989d", dark: "#46696d", light: "#98b9bd" },
    secondary: { main: "#7db0c5", light: "#aed7e9", dark: "#6fa8bf" },
    warning: { main: "#f59346", light: "#f8b784", dark: "#f27716" },
    backGround: { main: "#f5f5f5" },
  },
  text: { title: "#8d8d8d", body: "#474747" },
});
// Shared selector for filters and editable profile requirements.
function OptionSelect({
  field,
  form,
  option,
  label,
  placeholder,
  storeNames = false,
}) {
  const selected = form.values[field.name] || [];
  const values = selected.map((value) =>
    typeof value === "string" ? { name: value } : value,
  );
  return (
    <Multiselect
      id={field.name}
      options={option}
      placeholder={placeholder || label}
      selectedValues={values}
      onSelect={(next) =>
        form.setFieldValue(
          field.name,
          storeNames ? next.map((item) => item.name) : next,
        )
      }
    />
  );
}
export {
  Footer,
  Header,
  ImageUploader,
  InfiniteScroll,
  Loading,
  Multiselect,
  StarRating,
  createStyles,
  theme,
  OptionSelect,
};
