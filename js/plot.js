
function SystemPlot(scale,id,sx=500,sy=500){
    this.plotScaleFactor = scale;//100
    this.draw = SVG(id).size(sx,sy);
}
//Ellipses------------------------------------------------------------------------------
// ---- TODO - add arrow
SystemPlot.prototype.ellipse = function(jonesVector,center=[0,0],steps=25){
    let points = [];
    let theta = 0;
    for(let i=0; i<=25; i++){
        let point = math.chain(jonesVector).multiply(math.exp(math.multiply(math.i,theta))).add(center).multiply(this.plotScaleFactor).done();
        point.forEach((e,i) => {point[i]=e.re});
        points.push(math.add(center,point));
        theta += (2*math.PI/steps);
    }
    this.draw.polyline(points)
        .fill('none')
        .stroke({ width: 1 })
    return points;
}
SystemPlot.prototype.ellipseGrid = function(rayGrid,jvIn=[1,0],steps=25){
    for(let i=0; i<rayGrid.rayGridOut.length; i++){
        for(let j=0; j<rayGrid.rayGridOut[i].length; j++){
            let jvOut = math.multiply(rayGrid.rayGridOut[i][j].jonesMatrix(),jvIn);
            let center = [1.8*i+1.5,1.8*j+1.6];
            this.ellipse(jvOut,center,steps);
        }
    }
}
// Layout ------------------------------------------------------------------
// RAYs -------------------------------------------------------------------------
SystemPlot.prototype.drawRayPath = function(rayList,offSet){
    let points = [];
    for(let i=0; i<rayList.length; i++){
        let pt = rayList[i].r.slice(1,3).reverse();
        pt[1] += offSet;
        pt = math.multiply(pt, this.plotScaleFactor);
        points.push(pt);//get y-z values
    }
    this.draw.polyline(points)
      .fill('none')
      .stroke({ width: 1 })
      //.move(0, offSet);
}
SystemPlot.prototype.plotRayGrid = function(rayGrid,offSet){
    let grid = rayGrid.rayGridOut;
    for(let i = 0; i<grid.length; i++){
        for(let j = 0; j<grid[i].length; j++){
            this.drawRayPath(grid[i][j].rayList ,offSet);
        }
    }
}
//Surface --------------------------------------------------------------------------
// make new plot function -- for all surfaces 
// sample n times and use the sag function
SystemPlot.prototype.drawSurface = function(surf,offSet,n=20){
    ///
    let points =[];
    let perp = math.cross(surf.k,[1,0,0]);//y-z vals
    //need to go from -semi diamter to + semidiamter
    for(let i=0; i<=n; i++){
        let rad = -1*surf.aperture.semiDiameter + i*2*(surf.aperture.semiDiameter/n);
        let hpt = math.multiply(rad, perp).slice(1,3);
        let sagpt = math.multiply(surf.sag(rad), surf.k).slice(1,3);//y-z vals
        let ptTotal = math.chain( surf.r.slice(1,3)  ).add(hpt).add(sagpt).done();
        ptTotal[0] += offSet;
        points.push( math.multiply(ptTotal.reverse(),this.plotScaleFactor) );
    }
    this.draw.polyline(points)
        .fill('none')
        .stroke({ color: '#f06', width: 4, linecap: 'round', linejoin: 'round' })
    return points;
}  

 
//// MAIN -----------------------------------------------------------------------------------
SystemPlot.prototype.systemYPlot = function(rayField,opticalSystem){
    //First start by plotting the surfaces
    //get the max off set
    let surfs = opticalSystem.surfaces;
    let offSet = opticalSystem.maxSemiDiamter();
    for(let i = 0; i<surfs.length; i++){
        this.drawSurface(surfs[i],offSet);
    }
    let paths = rayField.rayPaths;
    for(let i = 0; i<paths.length; i++){
        this.drawRayPath(paths[i].rayList ,offSet);
    }
}
//// MAPS ----------------------------------------------------
//// MAPS ----------------------------------------------------
//// MAPS ----------------------------------------------------
//// MAPS ----------------------------------------------------
//// MAPS ----------------------------------------------------

//Diattenuation maps ------- 
///// Using plotly.js
DiattenuationSurfaceMap = function(divID,rayGrid,surfaceID=1,title="Diattenuation Surface "+surfaceID){
    let valueGrid = [];
    let valueRow = [];   
    for(let i=0; i<rayGrid.rayGridOut.length; i++){
        valueRow = [];
        for(let j=0; j<rayGrid.rayGridOut[i].length; j++){
            //get the ray with the correct surfaceID
            let ray = rayGrid.rayGridOut[i][j].getSurfaceRay(surfaceID);
            valueRow.push(ray.diattenuation());
        }
        valueGrid.push(valueRow);    
    }
    let data = [{
        z: valueGrid,
        type: 'contour',
        colorscale: 'Jet',
      }];
      
    let layout = {
        title: title
      };
      
    Plotly.newPlot(divID, data, layout, {showSendToCloud: true});    
}
///// Using plotly.js
DiattenuationTotalMap = function(divID,rayGrid,surfaceID=1,title="Total Diattenuation Surf "+surfaceID){
    let valueGrid = [];
    let valueRow = [];   
    for(let i=0; i<rayGrid.rayGridOut.length; i++){
        valueRow = [];
        for(let j=0; j<rayGrid.rayGridOut[i].length; j++){
            //get the ray with the correct surfaceID
            let rayPath = rayGrid.rayGridOut[i][j];
            valueRow.push(rayPath.diattenuation(surfaceID));
        }
        valueGrid.push(valueRow);    
    }
    let data = [{
        z: valueGrid,
        type: 'contour',
        colorscale: 'Jet',
      }];
      
    let layout = {
        title: title
      };
      
    Plotly.newPlot(divID, data, layout, {showSendToCloud: true});    
}

//Retardance maps ------- 
///// Using plotly.js
RetardanceSurfaceMap = function(divID,rayGrid,surfaceID=1,title="Retardance Surface "+surfaceID){
    let valueGrid = [];
    let valueRow = [];   
    for(let i=0; i<rayGrid.rayGridOut.length; i++){
        valueRow = [];
        for(let j=0; j<rayGrid.rayGridOut[i].length; j++){
            //get the ray with the correct surfaceID
            let ray = rayGrid.rayGridOut[i][j].getSurfaceRay(surfaceID);
            valueRow.push(ray.retardance());
        }
        valueGrid.push(valueRow);    
    }
    let data = [{
        z: valueGrid,
        type: 'contour',
        colorscale: 'Jet',
      }];
      
    let layout = {
        title: title
      };
      
    Plotly.newPlot(divID, data, layout, {showSendToCloud: true});    
}
///// Using plotly.js
RetardanceTotalMap = function(divID,rayGrid,surfaceID=1,title="Total Retardance Surf "+surfaceID){
    let valueGrid = [];
    let valueRow = [];   
    for(let i=0; i<rayGrid.rayGridOut.length; i++){
        valueRow = [];
        for(let j=0; j<rayGrid.rayGridOut[i].length; j++){
            //get the ray with the correct surfaceID
            let rayPath = rayGrid.rayGridOut[i][j];
            valueRow.push(rayPath.retardance(surfaceID));
        }
        valueGrid.push(valueRow);    
    }
    let data = [{
        z: valueGrid,
        type: 'contour',
        colorscale: 'Jet',
      }];
      
    let layout = {
        title: title
      };
      
    Plotly.newPlot(divID, data, layout, {showSendToCloud: true});    
}


////// ----- Fresnel aberration Plot
PlotFresnelCoefficients = function (divID,n1=1.0,n2=1.5,steps=90){
    RsData = {    
        type: 'scatter',
        x: [],
        y: [],
        mode: 'lines',
        name: 'Rs',
        line: {
            color: 'rgb(219, 64, 82)',
            width: 3
        }
    };
    RpData = {    
        type: 'scatter',
        x: [],
        y: [],
        mode: 'lines',
        name: 'Rp',
        line: {
            color: 'rgb(219, 64, 82)',
            dash: 'dashdot',
            width: 3
        }
    };
    // Transmission
    TsData = {    
        type: 'scatter',
        x: [],
        y: [],
        mode: 'lines',
        name: 'Ts',
        line: {
            color: 'rgb(55, 128, 191)',
            width: 3
        }
    };
    TpData = {    
        type: 'scatter',
        x: [],
        y: [],
        mode: 'lines',
        name: 'Tp',
        line: {
            color: 'rgb(55, 128, 191)',
            dash: 'dashdot',
            width: 3
        }
    };
    // now loop through theta and calculate the fresnel coefficients
    let ray = new RaySegment();
    ray.n = {n1:n1, n2:n2};
    ray.aoi = 0;

    let x = [];
    for(let i=0; i<steps; i++){
        ray.aoi = (math.PI/2)*(i/steps);
        x.push(ray.aoi);
        //calculate y data
        RsData.y.push( ray.Rs() );
        RpData.y.push( ray.Rp() );        
        TsData.y.push( ray.Ts() );
        TpData.y.push( ray.Tp() );
    }
    RsData.x = x;
    RpData.x = x;       
    TsData.x = x;
    TpData.x = x;
    var data = [RsData,RpData,TsData,TpData];

    let layout = {
        title: 'Fresnel Intensity '+n1+' - '+n2,
        xaxis: {
          title: 'AOI (rad)'
        },
        yaxis: {
          title: ''
        }
      };

    Plotly.newPlot(divID, data, layout, {showSendToCloud: true});
}
