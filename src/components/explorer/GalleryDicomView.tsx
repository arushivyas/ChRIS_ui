import * as React from "react";
import { Button } from "@patternfly/react-core";
import { CloseIcon } from "@patternfly/react-icons";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import GalleryModel from "../../api/models/gallery.model";
import GalleryWrapper from "../gallery/GalleryWrapper";
import DcmImageSeries from "../dicomViewer/DcmImageSeries";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import "./file-detail.scss";

type AllProps = {
  selectedFile: IUITreeNode;
  selectedFolder: IUITreeNode;
  toggleViewerMode: (isViewerMode: boolean) => void;
};
interface IState {
  urlArray: IUITreeNode[];
  inPlay: boolean;
}

const theme = createMuiTheme({
  overrides: {
    MuiFormControlLabel: {
      label: {
        fontSize: "0.85em",
      },
    },
    MuiFormLabel: {
      root: {
        "&$focused": {
          color: "#CCCCCC",
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#004d40",
    },
    secondary: {
      main: "#888888",
    },
    type: "dark",
  },
});

class GalleryDicomView extends React.Component<AllProps, IState> {
  _isMounted = false;
  runTool: (toolName: string, opt?: any) => void;
  timerScrolling: any;

  constructor(props: AllProps) {
    super(props);
    this.state = {
      urlArray: [],
      inPlay: false,
    };
    this.runTool = () => {};
    this.timerScrolling = null;
  }

  async componentDidMount() {
    this._isMounted = true;

    const urlArray = this._getUrlArray(this.props.selectedFolder.children);

    if (urlArray.length > 0 && this._isMounted) {
      this.setState({
        urlArray,
      });
    }
  }

  setPlayer = (status: boolean) => {
    this.setState({
      inPlay: status,
    });
  };

  render() {
    return <React.Fragment>{this.renderContent()}</React.Fragment>;
  }

  // Description: Render the individual viewers by filetype
  renderContent() {
    const { selectedFolder } = this.props;
    const { inPlay } = this.state;
    return (
      !!selectedFolder.children && (
        <GalleryWrapper
          total={this.state.urlArray.length}
          hideDownload
          handleOnToolbarAction={(action: string) => {
            (this.handleGalleryActions as any)[action].call();
          }}
          listOpenFilesScrolling={inPlay}
        >
          <Button
            className="close-btn"
            variant="link"
            onClick={() => this.props.toggleViewerMode(true)}
          >
            <CloseIcon size="md" />{" "}
          </Button>
          <MuiThemeProvider theme={theme}>
            <DcmImageSeries
              setPlayer={this.setPlayer}
              inPlay={this.state.inPlay}
              runTool={(ref: any) => {
                return (this.runTool = ref.runTool);
              }}
              imageArray={this.state.urlArray}
              handleToolbarAction={(action: string) => {
                (this.handleGalleryActions as any)[action].call();
              }}
            />
          </MuiThemeProvider>
        </GalleryWrapper>
      )
    );
  }

  // Only user dcm file - can add on to this
  _getUrlArray(selectedFolder: IUITreeNode[] = []) {
    const files = selectedFolder.filter((item: IUITreeNode) => {
      return GalleryModel.isValidFile(item.module);
    });
    return files;
    //
  }

  toolExecute = (tool: string) => {
    this.runTool(tool);
  };

  handleOpenImage = (cmdName: string) => {
    this.runTool("openImage", cmdName);
  };

  // Description: change the gallery item state

  handleGalleryActions = {
    next: () => {
      this.handleOpenImage("next");
    },
    previous: () => {
      this.handleOpenImage("previous");
    },
    play: () => {
      this.setState(
        {
          inPlay: true,
        },
        () => {
          this.handleOpenImage("play");
        }
      );
    },
    pause: () => {
      this.setState(
        {
          inPlay: false,
        },
        () => {
          this.handleOpenImage("pause");
        }
      );
    },
    first: () => {
      this.handleOpenImage("first");
    },
    last: () => {
      this.handleOpenImage("last");
    },

    zoom: () => {
      this.toolExecute("Zoom");
    },

    pan: () => {
      this.toolExecute("Pan");
    },

    wwwc: () => {
      this.toolExecute("Wwwc");
    },
    invert: () => {
      this.toolExecute("Invert");
    },

    magnify: () => {
      this.toolExecute("Magnify");
    },
    rotate: () => {
      this.toolExecute("Rotate");
    },
    stackScroll: () => {
      this.toolExecute("StackScroll");
    },
    reset: () => {
      this.toolExecute("Reset");
    },

    dicomHeader: () => {
      this.toolExecute("DicomHeader");
    },
  };

  componentWillUnmount() {
    clearInterval(this.timerScrolling);
    this._isMounted = false;
  }
}
export default GalleryDicomView;
