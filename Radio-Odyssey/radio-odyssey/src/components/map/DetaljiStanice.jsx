function DetaljiStanice({stanica}){

    if (!stanica) {
        return <div>Odaberite stanicu klikom na oznaku na karti</div>
    }
    return(
        <div>
            
            <h1> { stanica.name } </h1>
            <table>

                <tr>
                    <td>frekvencija:</td>
                    <td> {stanica.frekvencija}</td>
                </tr>
                <tr>
                    <td>žanr:</td>
                    <td>{stanica.vrstaGlazbe}</td>
                </tr>
              
            </table>
            
              
             
        </div>

    )
}
export default DetaljiStanice;