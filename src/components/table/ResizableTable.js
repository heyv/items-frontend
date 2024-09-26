import React, {Fragment, useEffect, useState, useRef} from 'react';
import { Grid, Input, Button, InputAdornment, IconButton } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import PlayCircleFilled from '@mui/icons-material/PlayCircleFilled';

const scrollToRef = (ref) => ref && ref.current ? window.scrollTo(0, ref.current.offsetTop - 75) : null;

let collumnResizeId = '';
let movingCollumnId = '';
let movingCollumnIndex = '';
let posicaoInicial = 0;
let tamanhoAtual = 0;
let newCollumnWidth = 0;

const mouseDownResizeHandler = function (collumnId, e) {
    const element = document.getElementById(collumnId);
    const resizerElement = document.getElementById(`resizer-${collumnId}`);
  
    resizerElement.style.borderRight = '2px solid blue';

    collumnResizeId = collumnId;

    posicaoInicial = e.clientX;
    tamanhoAtual = parseInt(window.getComputedStyle(element).width, 10);
};
  
const mouseMoveHandler = function (e) {
    if(!collumnResizeId) return;
  
    const colElement = document.getElementById(collumnResizeId);
    const colContentElement = document.getElementById(`th-${collumnResizeId}`);
    const labelElement = document.getElementById(`span-${collumnResizeId}`);

    let posicaoAtual = e.clientX;

    newCollumnWidth = tamanhoAtual + posicaoAtual - posicaoInicial;

    colElement.style.width = `${newCollumnWidth}px`;
    colContentElement.style.width = `${newCollumnWidth}px`;

    const labelWidth = parseInt(window.getComputedStyle(labelElement).width, 10);

    colElement.style.cursor = newCollumnWidth > labelWidth + 15 ? 'move' : 'not-allowed';
    colElement.draggable = newCollumnWidth > labelWidth + 15;

    let resizableDivs = document.getElementsByClassName(`resizableDiv-${collumnResizeId}`);

    for(let i = 0; i < resizableDivs.length; i++){
      resizableDivs[i].style.width = `${newCollumnWidth}px`;
    }    
};
  
const mouseUpHandler = function (onCollumnResize) {
    const resizerElement = document.getElementById(`resizer-${collumnResizeId}`);
  
    if(!resizerElement) return;

    resizerElement.style.borderRight = '';
    
    if(onCollumnResize) onCollumnResize({field: collumnResizeId, newWidth: newCollumnWidth});

    collumnResizeId = '';
    newCollumnWidth = 0;
};

const ResizableTable = ({tableStruct}) => {
    const [collumns, setColluns] = useState([]);
    const [records, setRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(tableStruct.startPage ? tableStruct.startPage : 0);
    const [jumpToPage, setJumpToPage] = useState('');
    const [dimensions, setDimensions] = useState({
      totalHeight: 0,
      header: 0,
      table: 0,
      footer: 0
    });
    const [selectCell, setSelectCell] = useState({
      id: null,
      field: null
    })

    const doc = useRef(null);

    useEffect(() => {
      const totalHeight = window.innerHeight;

      const dimensions = {
        totalHeight,
        header: totalHeight*0.1,
        body: totalHeight*0.7,
        footer: totalHeight*0.2
      }

      setDimensions(dimensions);
      setColluns(tableStruct.collumns);
      setRecords(tableStruct.data && tableStruct.data.length ? tableStruct.data : []);
    }, [tableStruct]);

    const leaveMovingCollumn = (e, targetId, targetIndex) => {
        const updatedCollumns = [...collumns];
        
        updatedCollumns.splice(movingCollumnIndex, 1);
        updatedCollumns.splice(targetIndex, 0, collumns[movingCollumnIndex]);

        setColluns(updatedCollumns);

        if(tableStruct.onCollumnMove) tableStruct.onCollumnMove(movingCollumnId, targetIndex);
    };

    const avancarPagina = page => {
      setCurrentPage(page - 1);
      scrollToRef(doc);
      if(tableStruct.onPageGo) tableStruct.onPageGo(page);
    }

    const customLinesStyles = tableStruct.customLinesStyles ? tableStruct.customLinesStyles : [];
    const startRecordIndex = tableStruct.rowsPerPage ? currentPage*tableStruct.rowsPerPage : 0;
    const endRecordIndex = tableStruct.rowsPerPage ? currentPage*tableStruct.rowsPerPage + tableStruct.rowsPerPage : records.length;
    const numPages = tableStruct.rowsPerPage ? Math.ceil(records.length/tableStruct.rowsPerPage) : 1;

    return(
      <Fragment>
          <div 
            style={{...styles.base}} 
            onMouseMove={e => mouseMoveHandler(e)} 
            onMouseUp={() => mouseUpHandler(tableStruct.onCollumnResize)} 
            onMouseLeave={() => mouseUpHandler(tableStruct.onCollumnResize)}
            ref={doc}
          >
              <table id="resizeTable" style={styles.table}>
                  <thead>
                      <tr>
                          {collumns.map((c, index) => 
                              <th id={`th-${c.field}`} style={styles.tableTh} key={index} title={c.title}>
                                  {c.custom ?
                                    c.custom
                                  :
                                    <div>
                                      <div 
                                        id={c.field}
                                        style={{...styles.collumnHeader, width: c.width ? c.width : undefined}}                                      
                                        draggable={true}
                                        onDragStart={() => {
                                            if(collumnResizeId) return;
                                            
                                            movingCollumnId = c.field;
                                            movingCollumnIndex = index;
                                          }}
                                        onDrop={(e) => leaveMovingCollumn(e, c.field, index)}
                                        onDragOver={(e) => e.preventDefault()}
                                      >
                                          <span id={`span-${c.field}`} style={{display: 'inline-block'}}>{c.title}</span>
                                      </div>
                                      <div 
                                          id={`resizer-${c.field}`} 
                                          onMouseDown={e => mouseDownResizeHandler(c.field, e)} 
                                          style={styles.resizer}
                                      >
                                      </div>
                                    </div>
                                  }
                                  
                              </th>
                          )}
                      </tr>
                  </thead>
                  <tbody>
                      {records.slice(startRecordIndex, endRecordIndex).map((r, key)=>{
                          let lineStyle = {backgroundColor: 'white'};

                          customLinesStyles.filter(cls => cls.id === r[tableStruct.idField]).forEach(cls => lineStyle = cls.style);

                          return (
                            <tr style={lineStyle} key={key}>
                                {collumns.map((c, key) => 
                                    <td 
                                      style={selectCell.id === r[tableStruct.idField] && selectCell.field === c.field ? styles.selectTableTd : styles.tableTd}
                                      onClick={() => {
                                        setSelectCell({id: r[tableStruct.idField], field: c.field});
                                      }}
                                      key={key}
                                    >
                                        {r[c.field] && r[c.field].component ? 
                                          r[c.field].component
                                        :
                                          <div
                                              className={`resizableDiv-${c.field}`}
                                              style={{
                                                ...styles.textContainer, 
                                                width: c.width ? c.width : undefined                                                
                                              }}
                                              title={r[c.field]}
                                              onClick={tableStruct.onCellClick ? () => 
                                                tableStruct.onCellClick({
                                                  id: r[tableStruct.idField], 
                                                  desc: r[tableStruct.descField],
                                                  collumnTitle: c.title,
                                                  field: c.field, 
                                                  value: r[c.field]
                                                })
                                                : undefined
                                              }
                                              onDoubleClick={tableStruct.onCellDoubleClick ? () => {
                                                  tableStruct.onCellDoubleClick({
                                                    id: r[tableStruct.idField], 
                                                    desc: r[tableStruct.descField], 
                                                    collumnTitle: c.title,
                                                    field: c.field, 
                                                    value: r[c.field]
                                                  })
                                              }
                                              : undefined}
                                          >
                                              {r[c.field]}
                                          </div>
                                        }
                                    </td>
                                )}
                            </tr>
                          )}
                      )}
                  </tbody>
              </table>
          </div>   
          {tableStruct.rowsPerPage &&
              <div style={styles.pagesNav}>
                  <PagesNav
                      pageNumber={currentPage + 1}
                      numPages={numPages}
                      setPageNumber={avancarPagina}
                      paginaIr={jumpToPage}
                      setPaginaIr={setJumpToPage}
                  />
              </div>    
          }        
      </Fragment> 
    )
}

export default ResizableTable;

const PagesNav = ({
    pageNumber,
    duasPaginas,
    numPages,
    setPageNumber,
    paginaIr,
    setPaginaIr,
  }) => (
    <Grid container>
      <Grid item md={3} xs={3} alignItems="center" justifyContent="space-between">
        <Button
          disabled={pageNumber === 1 ? true : false}
          variant="contained"
          size="lg"
          style={pageNumber === 1 ? {color: 'white', backgroundColor: 'white'} : {backgroundColor: 'black'}}
          onClick={() => {
            const qtdPagsVoltar = duasPaginas ? 2 : 1;
  
            if (pageNumber - qtdPagsVoltar > 0)
              return setPageNumber(pageNumber - qtdPagsVoltar);
  
            if (pageNumber - 1 > 0) setPageNumber(pageNumber - 1);
          }}
        >
          <ArrowBack />
        </Button>
      </Grid>
      <Grid item md={6} xs={6} justifyContent="center">
        <Grid container direction="row" justifyContent="center">
          <Grid item md={6} xs={12} alignContent="flex-end">
            {duasPaginas && numPages >= pageNumber + 1 && pageNumber > 1 ? (
              <h4>
                Páginas <b>{pageNumber}</b> e <b>{pageNumber + 1}</b> de{' '}
                <b>{numPages}</b>
              </h4>
            ) : (
              <h4>
                Página <b>{pageNumber}</b> de <b>{numPages}</b>
              </h4>
            )}
          </Grid>
          <Grid item md={6} xs={12} alignContent="flex-end">
            <Input
              id="standard-adornment-password"
              type="text"
              placeholder="Ir para a página"
              value={paginaIr}
              onChange={(e) => setPaginaIr(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (Number(paginaIr) > 0 && Number(paginaIr) <= numPages)
                    setPageNumber(Number(paginaIr));
                  setPaginaIr('');
                }
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => {
                      if (Number(paginaIr) > 0 && Number(paginaIr) <= numPages)
                        setPageNumber(Number(paginaIr));
                      setPaginaIr('');
                    }}
                  >
                    <PlayCircleFilled />
                  </IconButton>
                </InputAdornment>
              }
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item md={3} xs={3} style={{textAlign: 'right'}}>
        <Button
          variant="contained"
          size="lg"
          style={{backgroundColor: 'black'}}
          onClick={() => {
            const qtdPagsAvancar = duasPaginas && pageNumber > 1 ? 2 : 1;
  
            if (pageNumber + qtdPagsAvancar <= numPages)
              return setPageNumber(pageNumber + qtdPagsAvancar);
  
            if (pageNumber + 1 <= numPages) return setPageNumber(pageNumber + 1);
          }}
        >
          <ArrowForward />
        </Button>
      </Grid>
    </Grid>
);

const styles = {
    base:{
        backgroundColor: 'white',
        padding: 5,
        //overflow: 'auto',
        //position: 'relative'
    },
    table: {
        //border: '1px solid #ccc',
        borderSpacing: 0,
        emptyCells: 'show',
        position: 'relative',
        //borderCollapse: 'collapse'
    },
    tableTh: {        
        borderRight: '2px solid #ccc',
        position: 'sticky',
        padding: '0.15rem',
        marginBottom: '1px',
        top: 63,
        backgroundColor: "#bdd7ff",
        //height: 50,
        zIndex: 1,
        userSelect: 'none'
    },
    tableTd: {
        border: '1.5px solid #ccc',
        padding: '0.25rem'
    },
    selectTableTd: {
      border: '2px solid darkblue',
      backgroundColor: '#dedffa',
      padding: '0.25rem'
  },
    textContainer: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      //width: 160px; 
      height: '1.2em',
      whiteSpace: 'nowrap'
    },
    resizer: {
        height: 120,
        position: 'absolute',
        top: 0,
        right: 0,
        width: 5,
        cursor: 'col-resize',
        userSelect: 'none'
    },
    collumnHeader: {
        marginLeft: '10px',
        marginRight: '10px',
        cursor: 'move',
        userSelect: 'none',
        paddingLeft: '10px',
        paddingRight: '10px'
    },
    pagesNav: {
        marginTop: 15,
        padding: 10,
        backgroundColor: 'white'
    }
}