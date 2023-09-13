const calc = document.body.querySelector('.calc');
const metalType = calc.querySelector('.calcHeader__type');

const dn = calc.querySelector('.calcHeader__dn');
const thickness = calc.querySelector('.calcHeader__thickness');
const amount = calc.querySelector('.calcHeader__amount');
const angle = calc.querySelector('.calcHeader__angle');

const itemsTable = document.querySelector('.itemsTable__table');
const addBtn = document.querySelector('.calcHeader__add');

const amountPipeMaterial = calc.querySelector('.amountPipeMaterial .calcResults__value');
const amountGlueTotals = calc.querySelector('.amountGlue .calcResults__value');
const amountCleanerTotals = calc.querySelector('.amountCleaner .calcResults__value');
const amountTapeTotals = calc.querySelector('.amountTape .calcResults__value');
const amountRollMaterialTotals = calc.querySelector('.amountRollMaterial .calcResults__value');
const amountCoverMaterialTotals = calc.querySelector('.amountCoverMaterial .calcResults__value');

let selectedType = 'roll';

const dnValues = {21.3:21.3, 26.8:26.8, 32:32, 33.5:33.5,38:38,42.3:42.3,45:45,48:48,57:57,60:60,76:76,89:89,108:108,114:114,133:133,159:159,219:219,273:273,325:325,377:377,426:426};;
const dnValuesPipes90 = {21.3:21.3, 26.8:26.8, 32:32, 33.5:33.5,38:38,42.3:42.3,45:45,48:48,57:57,60:60,76:76,89:89,108:108,114:114,133:133,159:159};
const dnValuesPipes45 = {21.3:21.3, 26.8:26.8, 33.5:33.5, 45:45, 48:48 ,60:60, 76:76, 89:89, 114:114, 133:133, 159:159};
const angleValues = {90:1, 60:1.5, 45:2, 30:3};
const angleValuesPipes = {90:1, 45:2};

let tableId = 0;
let itemsPosition = [];

const { jsPDF } = window.jspdf;

function changeType(type) {
    if(type=="pipes"){
        selectedType = "pipes";
        dn.innerHTML = generateItems(dnValuesPipes90, "DN отвода");
        angle.innerHTML = generateItems(angleValuesPipes, "Угол отвода");
    } else {
        selectedType = "rolls";
        dn.innerHTML = generateItems(dnValues, "DN отвода");
        angle.innerHTML = generateItems(angleValues, "Угол отвода");
    }
}

function addTableItem(){
    tableId++;
    
    let dnv = Number(dn.value);
    let tv = Number(thickness.value.replace(/,/g, '.'));
    let amt = Number(amount.value.replace(/,/g, '.'));
    let ang = Number(angle.value);
    
   
    amount.reportValidity();
    thickness.reportValidity();
    dn.reportValidity();

    if(!dnv||!tv||!amt)
        return;
    let typeEl;
    if(selectedType=="rolls")
        typeEl = "Рулон";
    else
        typeEl = "Трубка";
    let thicknessValue = tv;
    let dnValue = dn.value;
    let radiusValue = angle[angle.selectedIndex].textContent;
    let amountValue = amt;

    let rollMatValue = calcRollMaterial(dnv, tv, amt, ang);;
    let tapeMatValue = calcTapeMaterial(dnv, ang);

    let coverMatValue = calcCoverMaterial(dnv, tv, amt, ang);
    let glueValue = calcAmountGlue(dnv, tv, amt, ang);
    let cleanerValue = calcAmountCleaner(dnv, tv, amt, ang);
    let tapeValue = calcAmountTape(dnv, tv, amt, ang);

    itemsPosition.push({
        id: tableId,
        type: typeEl,
        thickness: thicknessValue,
        dn: dnValue,
        radius: radiusValue,
        amount: amountValue,
        amountRollMaterial: rollMatValue,
        amountTapeMaterial: tapeMatValue,
        amountCoverMaterial: coverMatValue,
        amountGlue: glueValue,
        amountCleaner: cleanerValue,
        amountTape: tapeValue,
        
    });
    
    let row = itemsTable.insertRow();
    row.insertCell().innerHTML = typeEl;
    row.insertCell().innerHTML = thicknessValue;
    row.insertCell().innerHTML = dnValue;
    row.insertCell().innerHTML = radiusValue;
    row.insertCell().innerHTML = amountValue;
    row.insertCell().innerHTML = rollMatValue.toFixed(2);
    row.insertCell().innerHTML = tapeMatValue.toFixed(2),
    row.insertCell().innerHTML = coverMatValue.toFixed(2);
    row.insertCell().innerHTML = glueValue.toFixed(2);
    row.insertCell().innerHTML = cleanerValue.toFixed(2);
    row.insertCell().innerHTML = tapeValue.toFixed(2);

    row.insertCell().innerHTML = `<a class="itemsTable__removeRow" href="javascript:void(0);"></a>`;

    //console.log(row);
    let tId = tableId;
    console.log(itemsPosition);
    row.querySelector('.itemsTable__removeRow').addEventListener('click',()=>{
        itemsTable.deleteRow(row.rowIndex);
        console.log(itemsPosition);
        itemsPosition = itemsPosition.filter(obj => obj.id !== tId);
        updateResults();
    });
    updateResults();


}

addBtn.addEventListener('click',()=>{
    addTableItem();
});

dn.addEventListener("keyup",(e)=>{
    if(e.keyCode===13){
        addTableItem();
    }
});
thickness.addEventListener("keyup",(e)=>{
    if(e.keyCode===13){
        addTableItem();
    }
});
amount.addEventListener("keyup",(e)=>{
    if(e.keyCode===13){
        addTableItem();
    }
});
angle.addEventListener("change", ()=>{
    if(selectedType=='pipes')
        if(angle.value==1)
            dn.innerHTML = generateItems(dnValuesPipes90, "DN отвода");
        else 
            dn.innerHTML = generateItems(dnValuesPipes45, "DN отвода");
    dn.value = "";
});
document.querySelectorAll('.inputBlockTypes input[type="radio"]').forEach((el)=>{
    el.addEventListener('click', ()=>{
        changeType(el.dataset.calctype);
    });
});

function generateItems(itemObj, placeholder){
    let html = `<option value="" disabled selected>${placeholder}</option>`;
    console.log(itemObj);
    for(let item in itemObj) {
        html += `<option value="${itemObj[item]}">${item}</option>`
    }
    return html;
}

function getSt(dn){
    if(selectedType=='pipes')
        if(dn<=60)
            return 1.3;
        else
            return 1.5;
    return 1.2;
}
function mmInM(mm) {
    return mm/1000; //F8 E8
}


function getLenArcIn(dn) {
    let lens = {21.3:0.0273, 26.8:0.0244, 32:0.0346, 33.5:0.0332, 38:0.0456, 42.3:0.0421, 45:0.0589, 48:0.0516, 57:0.073, 60:0.072, 76:0.0974, 89:0.1186, 108:0.1508, 114:0.149, 133:0.194, 159:0.2286, 219:0.2992, 273:0.3746, 325:0.4516, 377:0.5286, 426:0.6079};
    return lens[dn];
}

function getLenArcOut(dn, angle) {
    //const lens = {21.3:0.061, 26.8:0.067, 32:0.085, 33.5:0.086, 38:0.105, 42.3:0.109, 45:0.130, 48:0.127, 57:0.163, 60:0.167, 76:0.217, 89:0.258, 108:0.320, 114:0.329, 133:0.403, 159:0.478, 219:0.643, 273:0.803, 325:0.962, 377:1.121, 426:1.277}
    return calcTapeMaterial(dn, angle);
}

function calcRollMaterial(dn, thickness, amount, angle) {
    let pipeValues ={
        21.3: 0.012,
        26.8: 0.010,
        32: 0.009,
        33.5: 0.007,
        38: 0.024,
        42.3: 0.028,
        45: 0.031,
        48: 0.035,
        57: 0.047,
        60: 0.051,
        76: 0.089,
        89: 0.118,
        108: 0.167,
        114: 0.185,
        133: 0.245,
        159: 0.343
    };
    if(selectedType=="rolls")
        return (2*(2*mmInM(dn)+2*mmInM(thickness))**2)*getSt(dn)*amount/angle;
    else
        return pipeValues[dn]*0.9;
}

function calcTapeMaterial(dn, angle) {
    let vals;
    console.log(angle);
    if(selectedType=="pipes"){
        if(angle==1){
            vals ={
                21.3:0.100,
                26.8:0.110,
                32:0.120,
                33.5:0.130,
                38:0.140,
                42.3:0.150,
                45:0.170,
                48:0.180,
                57:0.200,
                60:0.230,
                76:0.240,
                89:0.300,
                108:0.320,
                114:0.350,
                133:0.450,
                159:0.500
            };
        }
        else if(angle==2){
            vals ={21.3:0.070,
                26.8:0.080,
                33.5:0.090,
                45:0.095,
                48:0.100,
                60:0.150,
                76:0.190,
                89:0.250,
                114:0.290,
                133:0.350,
                159:0.400,
            };
        }
    } else {
        vals = {
            21.3:0.061,
            26.8:0.067,
            32:0.085,
            33.5:0.086,
            38:0.105,
            42.3:0.109,
            45:0.130,
            48:0.127,
            57:0.163,
            60:0.167,
            76:0.217,
            89:0.258,
            108:0.320,
            114:0.329,
            133:0.403,
            159:0.478,
            219:0.643,
            273:0.803,
            325:0.962,
            377:1.121,
            426:1.277,
        }
    }
    return vals[dn];
}

function calcAmountGlue(dn, thickness, amount, angle) {
    return (3.14/4*((mmInM(dn)+2*mmInM(thickness))**2-mmInM(dn)**2)*2+getLenArcOut(dn, angle)*mmInM(thickness)+getLenArcIn(dn)*mmInM(thickness))*0.3*getSt(dn)*amount/angle;
}

function calcAmountCleaner(dn, thickness, amount, angle) {
    return 0.25*calcAmountGlue(dn, thickness, amount, angle);
}

function calcAmountTape(dn, thickness, amount, angle) {
    return (getLenArcOut(dn, angle)+getLenArcIn(dn)+(3.14*(mmInM(dn)+2*mmInM(thickness)))*2)*getSt(dn)*amount/angle;
}

function calcCoverMaterial(dn, thickness, amount, angle) {
    return calcRollMaterial(dn, thickness, amount, angle)*1.1;
}

function calcAreaGluedSurface (dn, thickness, len, rollWidth) {
    //(((dn/1000+thickness*2/1000)*(dn/1000+thickness*2/1000))*3,1415926-(dn/1000*dn/1000)*3,1415926)*(len/widthRoll-1)+thickness/1000*len
    //return Number((((dn/1000+thickness*2/1000)*(dn/1000+thickness*2/1000))*3.1415926-(dn/1000*dn/1000)*3.1415926)*(len/2-1)+thickness/1000*len);
    return Number((((dn/1000+thickness*2/1000)*(dn/1000+thickness*2/1000))*3.1415926-(dn/1000*dn/1000)*3.1415926)*(len/rollWidth-1)+thickness/1000*len)
}


function getColumnSum(column) {
    return itemsPosition.reduce((acc, cur) => acc + cur[column], 0);
}

function updateResults() {
    amountPipeMaterial.textContent = getColumnSum("amountTapeMaterial").toFixed(2);
    amountGlueTotals.textContent = getColumnSum("amountGlue").toFixed(2);
    amountCleanerTotals.textContent = getColumnSum("amountCleaner").toFixed(2);
    amountTapeTotals.textContent = getColumnSum("amountTape").toFixed(2);
    amountRollMaterialTotals.textContent = getColumnSum("amountRollMaterial").toFixed(2);
    amountCoverMaterialTotals.textContent = getColumnSum("amountCoverMaterial").toFixed(2);
}



let pdfDoc = new jsPDF();

function headerPdf(title) {
    pdfDoc.addImage(document.querySelector('.pdfLogo'), 'PNG', 0, 5, 200, 20);
    pdfDoc.setFontSize(14);
    pdfDoc.text(5, 30, title);
}

function headerTable(h) {
    h+=8;
    pdfDoc.setFont("FuturaPT-Medium");

    pdfDoc.text(5, h, "Тип", {maxWidth:'12'});
    pdfDoc.text(15, h, "Толщина изоляции (мм)", {maxWidth:'20'});
    pdfDoc.text(35, h, "DN отвода (мм)", {maxWidth:'12'});
    pdfDoc.text(55, h, "Радиус отвода (мм)", {maxWidth:'12'});
    pdfDoc.text(75, h, "Количество (шт)", {maxWidth:'12'});
    pdfDoc.text(95, h, "Руллоный материал (м²)", {maxWidth:'17'});
    pdfDoc.text(115, h, "Трубный материал (м.п.)", {maxWidth:'17'});
    pdfDoc.text(135, h, "Покрывной материал (м²)", {maxWidth:'17'});
    pdfDoc.text(155, h, "Кол-во клея (л)", {maxWidth:'13'});
    pdfDoc.text(175, h, "Кол-во очистителя (л)", {maxWidth:'20'});
    pdfDoc.text(195, h, "Лента (м)", {maxWidth:'20'});


    pdfDoc.setFont("FuturaPT-Book");
}

function rowPdf(el,h) {

    h+=8;
    pdfDoc.setFont("FuturaPT-Medium");
    pdfDoc.setFont("FuturaPT-Book");
    pdfDoc.text(5, h, el.type);
    pdfDoc.text(15, h, el.thickness);
    pdfDoc.text(35, h, String(el.dn));
    pdfDoc.text(55, h, el.radius);
    pdfDoc.text(75, h, el.amount);
    pdfDoc.text(95, h, el.amountRollMaterial.toFixed(2));
    pdfDoc.text(115, h, el.amountTapeMaterial.toFixed(2));
    pdfDoc.text(135, h, el.amountCoverMaterial.toFixed(2));
    pdfDoc.text(155, h, el.amountGlue.toFixed(2));
    pdfDoc.text(175, h, el.amountCleaner.toFixed(2));
    pdfDoc.text(195, h, el.amountTape.toFixed(2));
    
}

function totalPdf(caption, value, unit, x, y) {
    pdfDoc.text(x, y, String(caption), {maxWidth:'27'});
    pdfDoc.setFont("FuturaPT-Medium");
    pdfDoc.text(x, y+10, value + " " + unit);
    pdfDoc.setFont("FuturaPT-Book");
}

function generatePdf() {
    
    pdfDoc.addFileToVFS('FuturaPT-Book-normal.ttf', font);
    pdfDoc.addFont('FuturaPT-Book-normal.ttf', 'FuturaPT-Book', 'normal');

    pdfDoc.addFileToVFS('FuturaPT-Medium-normal.ttf', fontMed);
    pdfDoc.addFont('FuturaPT-Medium-normal.ttf', 'FuturaPT-Medium', 'normal');
    pdfDoc.setFont("FuturaPT-Book");

    pdfDoc.setFontSize(14);

    headerPdf("Расчет материала и аксесуаров K-FLEX для ОТВОДОВ");

    pdfDoc.setFontSize(8);

    let i = 0;

    headerTable(33);
    for(i=0; i<itemsPosition.length; i++){
        rowPdf(itemsPosition[i],47+i*12);
    }
    pdfDoc.setFontSize(14);
    pdfDoc.text(5, 50 + itemsPosition.length*17, "Итого вам понадобиться:");
    pdfDoc.setFontSize(8);
    totalPdf("Количество трубок", getColumnSum("amountTapeMaterial").toFixed(2), " м.п.", 5, 60 + itemsPosition.length*17);
    totalPdf("Количество рулонного материала", getColumnSum("amountRollMaterial").toFixed(2), " м²", 35, 60 + itemsPosition.length*17);
    totalPdf("Количество покрывного материала", getColumnSum("amountCoverMaterial").toFixed(2), " м²", 65, 60 + itemsPosition.length*17);
    totalPdf("Количество клея", getColumnSum("amountGlue").toFixed(2), " литров", 95, 60 + itemsPosition.length*17);
    totalPdf("Количество очистителя", getColumnSum("amountCleaner").toFixed(2), " литров", 125, 60 + itemsPosition.length*17);
    totalPdf("Количество ленты", getColumnSum("amountTape").toFixed(2), " метров", 155, 60 + itemsPosition.length*17);

    //pdfDoc.text(160, 100+i*17, "Итого: " + document.querySelector('.products__total .num').textContent + "руб.") ;


    pdfDoc.save('output.pdf');
}

/* END PDF Generator */
document.querySelector('.calcGeneratePdf').addEventListener('click',()=>{
    generatePdf();
});

document.addEventListener("DOMContentLoaded",()=>{
    dn.innerHTML = generateItems(dnValues, "DN отвода");
    angle.innerHTML = generateItems(angleValues, "Угол отвода");
    changeType("rolls");
    document.querySelector('.inputBlockTypes input[data-calctype="roll"]').checked = true;
});